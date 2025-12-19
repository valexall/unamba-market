package com.irissoft.app.business;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.irissoft.app.dataaccess.CategoryRepository;
import com.irissoft.app.dataaccess.ProductImageRepository;
import com.irissoft.app.dataaccess.ProductRepository;
import com.irissoft.app.dataaccess.UserRepository;
import com.irissoft.app.dto.DtoProduct;
import com.irissoft.app.entity.Category;
import com.irissoft.app.entity.Product;
import com.irissoft.app.entity.ProductImage;
import com.irissoft.app.entity.User;
import com.irissoft.app.service.StorageService;

@Service
public class ProductBusiness {

    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private ProductImageRepository imageRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private StorageService storageService;

    @Transactional
    public boolean insert(DtoProduct dto, String sellerEmail, List<MultipartFile> images) {

        // 1. Validar Vendedor
        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 2. Procesar Categorías (Tags)
        List<Category> categoriesToSave = new ArrayList<>();

        if (dto.getCategoryNames() != null && !dto.getCategoryNames().isEmpty()) {
            for (String catName : dto.getCategoryNames()) {
                String cleanName = catName.trim();
                
                // A. Buscar si ya existe
                Category category = categoryRepository.findByNameIgnoreCase(cleanName)
                        .orElse(null);

                // B. Si no existe, crearla
                if (category == null) {
                    category = new Category();
                    category.setIdCategory(UUID.randomUUID().toString()); // ID manual
                    category.setName(cleanName);
                    category.setSlug(cleanName.toLowerCase().replace(" ", "-") + "-" + System.currentTimeMillis());
                    category.setIconCode("bi-tag-fill");
                    category.setCreatedAt(LocalDateTime.now());
                    category.setUpdatedAt(LocalDateTime.now());
                    
                    // CORRECCIÓN CLAVE: Usar saveAndFlush para forzar el INSERT inmediato
                    category = categoryRepository.saveAndFlush(category);
                }
                
                categoriesToSave.add(category);
            }
        }

        // 3. Crear Producto
        Product entity = new Product();
        entity.setIdProduct(UUID.randomUUID().toString());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setPrice(dto.getPrice());
        entity.setProductCondition(dto.getProductCondition());
        entity.setStatus("ACTIVO");
        entity.setViewCount(0);

        entity.setUser(seller);
        entity.setCategories(categoriesToSave); // Relación Many-to-Many

        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());

        productRepository.save(entity);

        // 4. Procesar Imágenes Múltiples
        if (images != null && !images.isEmpty()) {
            boolean isFirst = true; // La primera imagen será la portada (Main)

            for (MultipartFile file : images) {
                if (!file.isEmpty()) {
                    String filename = storageService.store(file);

                    ProductImage imgEntity = new ProductImage();
                    imgEntity.setIdImage(UUID.randomUUID().toString());
                    imgEntity.setProduct(entity);
                    imgEntity.setImageUrl(filename);
                    imgEntity.setMain(isFirst); // true solo para la primera
                    imgEntity.setCreatedAt(LocalDateTime.now());
                    // Asegúrate de que tu entidad ProductImage tenga updatedAt/deletedAt si los agregaste a la BD
                    // imgEntity.setUpdatedAt(LocalDateTime.now()); 

                    imageRepository.save(imgEntity);

                    isFirst = false; // Las siguientes no son portada
                }
            }
        }

        return true;
    }

    public List<DtoProduct> getAll() {
        List<Product> listEntities = productRepository.findAll();
        List<DtoProduct> listDtos = new ArrayList<>();

        for (Product entity : listEntities) {
            DtoProduct dto = new DtoProduct();
            dto.setIdProduct(entity.getIdProduct());
            dto.setName(entity.getName());
            dto.setDescription(entity.getDescription());
            dto.setPrice(entity.getPrice());
            dto.setStatus(entity.getStatus());
            dto.setProductCondition(entity.getProductCondition());

            // --- Mapeo de Categorías Múltiples ---
            if (entity.getCategories() != null && !entity.getCategories().isEmpty()) {
                // String para mostrar en tarjeta: "Libros, Apuntes"
                String catDisplay = entity.getCategories().stream()
                        .map(Category::getName)
                        .collect(Collectors.joining(", "));
                
                dto.setCategoryName(catDisplay);
                
                // Lista para lógica del front
                dto.setCategoryNames(entity.getCategories().stream()
                        .map(Category::getName)
                        .collect(Collectors.toList()));
            } else {
                dto.setCategoryName("Sin categoría");
            }
            // -------------------------------------

            dto.setSellerName(entity.getUser().getFirstName() + " " + entity.getUser().getLastName());
            dto.setSellerId(entity.getUser().getIdUser());

            // --- Obtener Imagen Principal ---
            List<ProductImage> images = imageRepository.findByProduct_IdProduct(entity.getIdProduct());

            if (images != null && !images.isEmpty()) {
                // Busca la "Main", o toma la primera por defecto
                ProductImage mainImage = images.stream()
                        .filter(ProductImage::isMain) 
                        .findFirst()
                        .orElse(images.get(0));

                dto.setImageUrl(mainImage.getImageUrl());
            } else {
                dto.setImageUrl(null);
            }
            // --------------------------------

            listDtos.add(dto);
        }
        return listDtos;
    }

    public DtoProduct getById(String idProduct) {
        Product entity = productRepository.findById(idProduct)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        
        DtoProduct dto = new DtoProduct();
        dto.setIdProduct(entity.getIdProduct());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setPrice(entity.getPrice());
        dto.setStatus(entity.getStatus());
        dto.setProductCondition(entity.getProductCondition());
        dto.setViewCount(entity.getViewCount());
        
        // Tags
        if (entity.getCategories() != null) {
            dto.setCategoryNames(entity.getCategories().stream().map(Category::getName).collect(Collectors.toList()));
            dto.setCategoryName(String.join(", ", dto.getCategoryNames()));
        }
        
        // Vendedor
        dto.setSellerName(entity.getUser().getFirstName() + " " + entity.getUser().getLastName());
        dto.setSellerId(entity.getUser().getIdUser());
 
        List<ProductImage> images = imageRepository.findByProduct_IdProduct(entity.getIdProduct());
        if (images != null && !images.isEmpty()) {
            dto.setImageUrl(images.get(0).getImageUrl()); // La primera por defecto
            // Si modificaste DtoProduct para tener List<String> imagesList, aquí lo llenarías.
        }

        List<ProductImage> imagesEntities = imageRepository.findByProduct_IdProduct(entity.getIdProduct());
        
        if (imagesEntities != null && !imagesEntities.isEmpty()) {
            // 1. Setear imagen principal (para la vista rápida en Home)
            ProductImage mainImg = imagesEntities.stream()
                .filter(img -> img.isMain())
                .findFirst()
                .orElse(imagesEntities.get(0));
            dto.setImageUrl(mainImg.getImageUrl());
            
            // 2. Setear la galería completa (NUEVO)
            List<String> imageNames = imagesEntities.stream()
                .map(ProductImage::getImageUrl)
                .collect(Collectors.toList());
            dto.setImages(imageNames);
        }
        
        return dto;
    }
}