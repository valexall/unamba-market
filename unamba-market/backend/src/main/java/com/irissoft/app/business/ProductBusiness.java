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

        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        List<Category> categoriesToSave = new ArrayList<>();

        if (dto.getCategoryNames() != null && !dto.getCategoryNames().isEmpty()) {
            for (String catName : dto.getCategoryNames()) {
                String cleanName = catName.trim();
                Category category = categoryRepository.findByNameIgnoreCase(cleanName)
                        .orElse(null);
                if (category == null) {
                    category = new Category();
                    category.setIdCategory(UUID.randomUUID().toString());
                    category.setName(cleanName);
                    category.setSlug(cleanName.toLowerCase().replace(" ", "-") + "-" + System.currentTimeMillis());
                    category.setIconCode("bi-tag-fill");
                    category.setCreatedAt(LocalDateTime.now());
                    category.setUpdatedAt(LocalDateTime.now());
                    category = categoryRepository.saveAndFlush(category);
                }

                categoriesToSave.add(category);
            }
        }

        Product entity = new Product();
        entity.setIdProduct(UUID.randomUUID().toString());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setPrice(dto.getPrice());
        entity.setProductCondition(dto.getProductCondition());
        entity.setStatus("ACTIVO");
        entity.setViewCount(0);

        entity.setUser(seller);
        entity.setCategories(categoriesToSave);

        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());

        productRepository.save(entity);
        if (images != null && !images.isEmpty()) {
            boolean isFirst = true;

            for (MultipartFile file : images) {
                if (!file.isEmpty()) {
                    String filename = storageService.store(file);

                    ProductImage imgEntity = new ProductImage();
                    imgEntity.setIdImage(UUID.randomUUID().toString());
                    imgEntity.setProduct(entity);
                    imgEntity.setImageUrl(filename);
                    imgEntity.setMain(isFirst);
                    imgEntity.setCreatedAt(LocalDateTime.now());
                    imageRepository.save(imgEntity);

                    isFirst = false;
                }
            }
        }

        return true;
    }

    public List<DtoProduct> getAll() {
        List<Product> listEntities = productRepository.findByStatusOrderByCreatedAtDesc("ACTIVO");
        List<DtoProduct> listDtos = new ArrayList<>();

        for (Product entity : listEntities) {
            DtoProduct dto = new DtoProduct();
            dto.setIdProduct(entity.getIdProduct());
            dto.setName(entity.getName());
            dto.setDescription(entity.getDescription());
            dto.setPrice(entity.getPrice());
            dto.setStatus(entity.getStatus());
            dto.setProductCondition(entity.getProductCondition());
            if (entity.getCategories() != null && !entity.getCategories().isEmpty()) {
                String catDisplay = entity.getCategories().stream()
                        .map(Category::getName)
                        .collect(Collectors.joining(", "));

                dto.setCategoryName(catDisplay);
                dto.setCategoryNames(entity.getCategories().stream()
                        .map(Category::getName)
                        .collect(Collectors.toList()));
            } else {
                dto.setCategoryName("Sin categoría");
            }
            dto.setSellerName(entity.getUser().getFirstName() + " " + entity.getUser().getLastName());
            dto.setSellerId(entity.getUser().getIdUser());
            List<ProductImage> images = imageRepository.findByProduct_IdProduct(entity.getIdProduct());

            if (images != null && !images.isEmpty()) {
                ProductImage mainImage = images.stream()
                        .filter(ProductImage::isMain)
                        .findFirst()
                        .orElse(images.get(0));

                dto.setImageUrl(mainImage.getImageUrl());
            } else {
                dto.setImageUrl(null);
            }

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

        if (entity.getCategories() != null) {
            dto.setCategoryNames(entity.getCategories().stream().map(Category::getName).collect(Collectors.toList()));
            dto.setCategoryName(String.join(", ", dto.getCategoryNames()));
        }

        dto.setSellerName(entity.getUser().getFirstName() + " " + entity.getUser().getLastName());
        dto.setSellerId(entity.getUser().getIdUser());

        List<ProductImage> images = imageRepository.findByProduct_IdProduct(entity.getIdProduct());
        if (images != null && !images.isEmpty()) {
            dto.setImageUrl(images.get(0).getImageUrl()); // La primera por defecto
        }

        List<ProductImage> imagesEntities = imageRepository.findByProduct_IdProduct(entity.getIdProduct());

        if (imagesEntities != null && !imagesEntities.isEmpty()) {
            ProductImage mainImg = imagesEntities.stream()
                    .filter(img -> img.isMain())
                    .findFirst()
                    .orElse(imagesEntities.get(0));
            dto.setImageUrl(mainImg.getImageUrl());

            List<String> imageNames = imagesEntities.stream()
                    .map(ProductImage::getImageUrl)
                    .collect(Collectors.toList());
            dto.setImages(imageNames);
        }

        return dto;
    }

    public List<DtoProduct> getMyProducts(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        List<Product> listEntities = productRepository.findByUser_IdUser(user.getIdUser());

        List<DtoProduct> listDtos = new ArrayList<>();
        for (Product entity : listEntities) {
            DtoProduct dto = new DtoProduct();
            dto.setIdProduct(entity.getIdProduct());
            dto.setName(entity.getName());
            dto.setPrice(entity.getPrice());
            dto.setStatus(entity.getStatus()); 
            dto.setProductCondition(entity.getProductCondition());
            dto.setViewCount(entity.getViewCount());
            List<ProductImage> images = imageRepository.findByProduct_IdProduct(entity.getIdProduct());
            if (!images.isEmpty())
                dto.setImageUrl(images.get(0).getImageUrl());

            listDtos.add(dto);
        }
        return listDtos;
    }

    @Transactional
    public void updateStatus(String idProduct, String newStatus, String userEmail) {
        Product product = productRepository.findById(idProduct)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        if (!product.getUser().getIdUser().equals(user.getIdUser())) {
            throw new RuntimeException("No tienes permiso para modificar este producto.");
        }
        if (List.of("ACTIVO", "PAUSADO", "VENDIDO", "ELIMINADO").contains(newStatus)) {
            product.setStatus(newStatus);

            if ("ELIMINADO".equals(newStatus)) {
                product.setDeletedAt(LocalDateTime.now());
            } else {
                product.setDeletedAt(null);
            }

            product.setUpdatedAt(LocalDateTime.now());
            productRepository.save(product);
        } else {
            throw new RuntimeException("Estado no válido: " + newStatus);
        }
    }

    @Transactional
    public boolean update(String idProduct, DtoProduct dto, String userEmail, List<MultipartFile> images) {
        Product product = productRepository.findById(idProduct)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Verificar que el usuario sea el propietario
        if (!product.getUser().getIdUser().equals(user.getIdUser())) {
            throw new RuntimeException("No tienes permiso para modificar este producto.");
        }

        // Actualizar campos básicos
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setProductCondition(dto.getProductCondition());
        product.setUpdatedAt(LocalDateTime.now());

        // Actualizar categorías
        if (dto.getCategoryNames() != null && !dto.getCategoryNames().isEmpty()) {
            List<Category> categoriesToSave = new ArrayList<>();
            
            for (String catName : dto.getCategoryNames()) {
                String cleanName = catName.trim();
                Category category = categoryRepository.findByNameIgnoreCase(cleanName)
                        .orElse(null);
                if (category == null) {
                    category = new Category();
                    category.setIdCategory(UUID.randomUUID().toString());
                    category.setName(cleanName);
                    category.setSlug(cleanName.toLowerCase().replace(" ", "-") + "-" + System.currentTimeMillis());
                    category.setIconCode("bi-tag-fill");
                    category.setCreatedAt(LocalDateTime.now());
                    category.setUpdatedAt(LocalDateTime.now());
                    category = categoryRepository.saveAndFlush(category);
                }
                categoriesToSave.add(category);
            }
            product.setCategories(categoriesToSave);
        }

        productRepository.save(product);

        // Agregar nuevas imágenes si se proporcionan
        if (images != null && !images.isEmpty()) {
            // Obtener imágenes existentes
            List<ProductImage> existingImages = imageRepository.findByProduct_IdProduct(idProduct);
            boolean hasMain = !existingImages.isEmpty();
            
            for (MultipartFile file : images) {
                if (!file.isEmpty()) {
                    String filename = storageService.store(file);
                    
                    ProductImage imgEntity = new ProductImage();
                    imgEntity.setIdImage(UUID.randomUUID().toString());
                    imgEntity.setProduct(product);
                    imgEntity.setImageUrl(filename);
                    imgEntity.setMain(!hasMain); // La primera nueva imagen es main si no hay ninguna
                    imgEntity.setCreatedAt(LocalDateTime.now());
                    imageRepository.save(imgEntity);
                    
                    hasMain = true;
                }
            }
        }

        return true;
    }
}