import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants';
import { Product, ProductUnit, UNIT_LABELS, Category } from '../../src/types';
import { api } from '../../src/services/api';

const UNITS: { value: ProductUnit; label: string }[] = [
  { value: 'KG', label: 'Kilogramme (Kg)' },
  { value: 'GRAM', label: 'Gramme (g)' },
  { value: 'UNIT', label: 'Unité' },
  { value: 'LITER', label: 'Litre (L)' },
  { value: 'TAS', label: 'Tas' },
  { value: 'BUNCH', label: 'Botte' },
];

interface FormData {
  name: string;
  description: string;
  price: string;
  unit: ProductUnit;
  categoryId: string;
  stock: string;
  minQuantity: string;
  origin: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  price?: string;
  categoryId?: string;
  stock?: string;
}

export default function ProductFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const [form, setForm] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    unit: 'KG',
    categoryId: '',
    stock: '',
    minQuantity: '1',
    origin: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [existingImages, setExistingImages] = useState<{ id: string; url: string }[]>([]);
  const [newImages, setNewImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const catRes = await api.getCategories();
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      }

      if (isEdit && id) {
        const prodRes = await api.getProduct(id);
        if (prodRes.success && prodRes.data) {
          const p = prodRes.data;
          setForm({
            name: p.name,
            description: p.description,
            price: String(p.price),
            unit: p.unit,
            categoryId: p.categoryId,
            stock: String(p.stock),
            minQuantity: String(p.minQuantity),
            origin: p.origin || '',
          });
          if (p.images) {
            setExistingImages(p.images.map(img => ({ id: img.id, url: img.url })));
          }
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) newErrors.name = 'Le nom est requis';
    if (!form.description.trim()) newErrors.description = 'La description est requise';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) {
      newErrors.price = 'Le prix doit être un nombre positif';
    }
    if (!form.categoryId) newErrors.categoryId = 'La catégorie est requise';
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0) {
      newErrors.stock = 'Le stock doit être un nombre positif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission requise', "L'accès à la galerie est nécessaire pour ajouter des images.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setNewImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = async (imageId: string) => {
    if (!id) return;
    try {
      const res = await api.deleteProductImage(id, imageId);
      if (res.success) {
        setExistingImages(prev => prev.filter(img => img.id !== imageId));
      }
    } catch (error) {
      Alert.alert('Erreur', "Impossible de supprimer l'image");
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const productData = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        unit: form.unit,
        categoryId: form.categoryId,
        stock: Number(form.stock),
        minQuantity: Number(form.minQuantity) || 1,
        origin: form.origin.trim() || undefined,
      };

      let productId = id;

      if (isEdit && id) {
        const res = await api.updateProduct(id, productData);
        if (!res.success) {
          Alert.alert('Erreur', res.error || 'Impossible de modifier le produit');
          return;
        }
      } else {
        const res = await api.createProduct(productData);
        if (!res.success || !res.data) {
          Alert.alert('Erreur', res.error || 'Impossible de créer le produit');
          return;
        }
        productId = res.data.id;
      }

      // Upload new images
      for (const uri of newImages) {
        try {
          const uploadRes = await api.uploadImage(uri);
          if (uploadRes.success && uploadRes.data && productId) {
            await api.addProductImage(productId, {
              url: uploadRes.data.url,
              isPrimary: existingImages.length === 0 && newImages.indexOf(uri) === 0,
            });
          }
        } catch (err) {
          console.error('Image upload error:', err);
        }
      }

      router.replace('/(tabs)/my-products');
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find(c => c.id === form.categoryId);
  const selectedUnit = UNITS.find(u => u.value === form.unit);

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ title: isEdit ? 'Modifier le produit' : 'Nouveau produit' }} />
        <ActivityIndicator size="large" color={COLORS.primary[500]} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Stack.Screen
        options={{
          title: isEdit ? 'Modifier le produit' : 'Nouveau produit',
          headerBackTitle: 'Retour',
        }}
      />

      {/* Images */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Photos</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>
          {existingImages.map(img => (
            <View key={img.id} style={styles.imageWrapper}>
              <Image source={{ uri: img.url }} style={styles.imageThumb} />
              <TouchableOpacity
                style={styles.imageRemoveBtn}
                onPress={() => handleRemoveExistingImage(img.id)}
              >
                <Ionicons name="close-circle" size={22} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          ))}
          {newImages.map((uri, index) => (
            <View key={`new_${index}`} style={styles.imageWrapper}>
              <Image source={{ uri }} style={styles.imageThumb} />
              <TouchableOpacity
                style={styles.imageRemoveBtn}
                onPress={() => handleRemoveNewImage(index)}
              >
                <Ionicons name="close-circle" size={22} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.addImageBtn} onPress={handlePickImage}>
            <Ionicons name="camera-outline" size={28} color={COLORS.gray[400]} />
            <Text style={styles.addImageText}>Ajouter</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Name */}
      <View style={styles.section}>
        <Text style={styles.label}>Nom du produit *</Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          value={form.name}
          onChangeText={text => {
            setForm(prev => ({ ...prev, name: text }));
            if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
          }}
          placeholder="Ex: Tomates fraîches"
          placeholderTextColor={COLORS.gray[400]}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea, errors.description && styles.inputError]}
          value={form.description}
          onChangeText={text => {
            setForm(prev => ({ ...prev, description: text }));
            if (errors.description) setErrors(prev => ({ ...prev, description: undefined }));
          }}
          placeholder="Décrivez votre produit..."
          placeholderTextColor={COLORS.gray[400]}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
      </View>

      {/* Category Picker */}
      <View style={styles.section}>
        <Text style={styles.label}>Catégorie *</Text>
        <TouchableOpacity
          style={[styles.pickerButton, errors.categoryId && styles.inputError]}
          onPress={() => setShowCategoryPicker(!showCategoryPicker)}
        >
          <Text style={selectedCategory ? styles.pickerValue : styles.pickerPlaceholder}>
            {selectedCategory ? selectedCategory.name : 'Sélectionner une catégorie'}
          </Text>
          <Ionicons
            name={showCategoryPicker ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={COLORS.gray[400]}
          />
        </TouchableOpacity>
        {errors.categoryId && <Text style={styles.errorText}>{errors.categoryId}</Text>}
        {showCategoryPicker && (
          <View style={styles.pickerOptions}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.pickerOption,
                  cat.id === form.categoryId && styles.pickerOptionSelected,
                ]}
                onPress={() => {
                  setForm(prev => ({ ...prev, categoryId: cat.id }));
                  setShowCategoryPicker(false);
                  if (errors.categoryId) setErrors(prev => ({ ...prev, categoryId: undefined }));
                }}
              >
                <Text style={styles.pickerOptionIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.pickerOptionText,
                    cat.id === form.categoryId && styles.pickerOptionTextSelected,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Price + Unit */}
      <View style={styles.row}>
        <View style={[styles.section, { flex: 1 }]}>
          <Text style={styles.label}>Prix (FCFA) *</Text>
          <TextInput
            style={[styles.input, errors.price && styles.inputError]}
            value={form.price}
            onChangeText={text => {
              setForm(prev => ({ ...prev, price: text }));
              if (errors.price) setErrors(prev => ({ ...prev, price: undefined }));
            }}
            placeholder="0"
            placeholderTextColor={COLORS.gray[400]}
            keyboardType="numeric"
          />
          {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
        </View>

        <View style={[styles.section, { flex: 1, marginLeft: SPACING.sm }]}>
          <Text style={styles.label}>Unité</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowUnitPicker(!showUnitPicker)}
          >
            <Text style={styles.pickerValue}>{selectedUnit?.label || form.unit}</Text>
            <Ionicons
              name={showUnitPicker ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={COLORS.gray[400]}
            />
          </TouchableOpacity>
          {showUnitPicker && (
            <View style={styles.pickerOptions}>
              {UNITS.map(u => (
                <TouchableOpacity
                  key={u.value}
                  style={[
                    styles.pickerOption,
                    u.value === form.unit && styles.pickerOptionSelected,
                  ]}
                  onPress={() => {
                    setForm(prev => ({ ...prev, unit: u.value }));
                    setShowUnitPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerOptionText,
                      u.value === form.unit && styles.pickerOptionTextSelected,
                    ]}
                  >
                    {u.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Stock + Min Quantity */}
      <View style={styles.row}>
        <View style={[styles.section, { flex: 1 }]}>
          <Text style={styles.label}>Stock disponible *</Text>
          <TextInput
            style={[styles.input, errors.stock && styles.inputError]}
            value={form.stock}
            onChangeText={text => {
              setForm(prev => ({ ...prev, stock: text }));
              if (errors.stock) setErrors(prev => ({ ...prev, stock: undefined }));
            }}
            placeholder="0"
            placeholderTextColor={COLORS.gray[400]}
            keyboardType="numeric"
          />
          {errors.stock && <Text style={styles.errorText}>{errors.stock}</Text>}
        </View>

        <View style={[styles.section, { flex: 1, marginLeft: SPACING.sm }]}>
          <Text style={styles.label}>Quantité min.</Text>
          <TextInput
            style={styles.input}
            value={form.minQuantity}
            onChangeText={text => setForm(prev => ({ ...prev, minQuantity: text }))}
            placeholder="1"
            placeholderTextColor={COLORS.gray[400]}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Origin */}
      <View style={styles.section}>
        <Text style={styles.label}>Origine</Text>
        <TextInput
          style={styles.input}
          value={form.origin}
          onChangeText={text => setForm(prev => ({ ...prev, origin: text }))}
          placeholder="Ex: Yaoundé, Cameroun"
          placeholderTextColor={COLORS.gray[400]}
        />
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <>
            <Ionicons
              name={isEdit ? 'checkmark-circle-outline' : 'add-circle-outline'}
              size={20}
              color={COLORS.white}
            />
            <Text style={styles.submitButtonText}>
              {isEdit ? 'Enregistrer les modifications' : 'Créer le produit'}
            </Text>
          </>
        )}
      </TouchableOpacity>

      <View style={{ height: SPACING.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray[700],
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 15,
    color: COLORS.gray[900],
  },
  inputError: {
    borderColor: COLORS.error,
  },
  textArea: {
    minHeight: 100,
    paddingTop: SPACING.sm,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  row: {
    flexDirection: 'row',
  },
  pickerButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerValue: {
    fontSize: 15,
    color: COLORS.gray[900],
  },
  pickerPlaceholder: {
    fontSize: 15,
    color: COLORS.gray[400],
  },
  pickerOptions: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.xs,
    overflow: 'hidden',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  pickerOptionSelected: {
    backgroundColor: COLORS.primary[50],
  },
  pickerOptionIcon: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  pickerOptionText: {
    fontSize: 14,
    color: COLORS.gray[700],
  },
  pickerOptionTextSelected: {
    color: COLORS.primary[600],
    fontWeight: '600',
  },
  imageRow: {
    flexDirection: 'row',
  },
  imageWrapper: {
    marginRight: SPACING.sm,
    position: 'relative',
  },
  imageThumb: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
  },
  imageRemoveBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: COLORS.white,
    borderRadius: 11,
  },
  addImageBtn: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    fontSize: 11,
    color: COLORS.gray[400],
    marginTop: 2,
  },
  submitButton: {
    backgroundColor: COLORS.primary[500],
    marginHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
