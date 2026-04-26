package com.quickbite.controller;

import com.quickbite.dto.CategoryDTO;
import com.quickbite.dto.MenuItemDTO;
import com.quickbite.entity.Category;
import com.quickbite.entity.MenuItem;
import com.quickbite.service.MenuService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/menu")
@Slf4j
public class MenuController {

    @Autowired
    private MenuService menuService;

    // ==================== Category Endpoints ====================

    @PostMapping("/categories")
    public ResponseEntity<CategoryDTO> createCategory(@RequestBody CategoryDTO dto) {
        log.info("Create category request for restaurant: {}", dto.getRestaurantId());
        Category created = menuService.createCategory(
                dto.getRestaurantId(), dto.getName(), dto.getDescription(), dto.getDisplayOrder());
        return ResponseEntity.status(HttpStatus.CREATED).body(mapCategoryToDTO(created));
    }

    @GetMapping("/categories/restaurant/{restaurantId}")
    public ResponseEntity<List<CategoryDTO>> getRestaurantCategories(@PathVariable("restaurantId") Long restaurantId) {
        List<CategoryDTO> categories = menuService.getRestaurantCategories(restaurantId).stream()
                .map(this::mapCategoryToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(categories);
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<CategoryDTO> updateCategory(
            @PathVariable("id") Long id, @RequestBody CategoryDTO dto) {
        Category updateData = new Category();
        updateData.setName(dto.getName());
        updateData.setDescription(dto.getDescription());
        updateData.setDisplayOrder(dto.getDisplayOrder());
        updateData.setIsActive(dto.getIsActive());
        updateData.setImageUrl(dto.getImageUrl());

        Category updated = menuService.updateCategory(id, updateData);
        return ResponseEntity.ok(mapCategoryToDTO(updated));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable("id") Long id) {
        menuService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== Menu Item Endpoints ====================

    @PostMapping("/items")
    public ResponseEntity<MenuItemDTO> createMenuItem(@RequestBody MenuItemDTO dto) {
        log.info("Create menu item request for restaurant: {}", dto.getRestaurantId());
        MenuItem created = menuService.createMenuItem(
                dto.getRestaurantId(), dto.getCategoryId(), dto.getName(), dto.getDescription(),
                dto.getPrice(), dto.getDiscountedPrice(), dto.getPreparationTime(),
                dto.getIsVegetarian(), dto.getIsSpicy());
        return ResponseEntity.status(HttpStatus.CREATED).body(mapMenuItemToDTO(created));
    }

    @GetMapping("/items")
    public ResponseEntity<List<MenuItemDTO>> getAllMenuItems() {
        log.info("Fetching all menu items");
        List<MenuItemDTO> items = menuService.getAllMenuItems().stream()
                .map(this::mapMenuItemToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(items);
    }

    @GetMapping("/items/{id}")
    public ResponseEntity<MenuItemDTO> getMenuItem(@PathVariable("id") Long id) {
        MenuItem item = menuService.getMenuItem(id);
        return ResponseEntity.ok(mapMenuItemToDTO(item));
    }

    @GetMapping("/items/restaurant/{restaurantId}")
    public ResponseEntity<List<MenuItemDTO>> getRestaurantMenu(@PathVariable("restaurantId") Long restaurantId) {
        List<MenuItemDTO> items = menuService.getRestaurantMenu(restaurantId).stream()
                .map(this::mapMenuItemToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(items);
    }

    @GetMapping("/items/category/{categoryId}")
    public ResponseEntity<List<MenuItemDTO>> getCategoryItems(@PathVariable("categoryId") Long categoryId) {
        List<MenuItemDTO> items = menuService.getCategoryItems(categoryId).stream()
                .map(this::mapMenuItemToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(items);
    }

    @GetMapping("/items/restaurant/{restaurantId}/available")
    public ResponseEntity<List<MenuItemDTO>> getAvailableItems(@PathVariable("restaurantId") Long restaurantId) {
        List<MenuItemDTO> items = menuService.getAvailableItems(restaurantId).stream()
                .map(this::mapMenuItemToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(items);
    }

    @GetMapping("/items/restaurant/{restaurantId}/veg")
    public ResponseEntity<List<MenuItemDTO>> getVegetarianItems(@PathVariable("restaurantId") Long restaurantId) {
        List<MenuItemDTO> items = menuService.getVegetarianItems(restaurantId).stream()
                .map(this::mapMenuItemToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(items);
    }

    @GetMapping("/items/search")
    public ResponseEntity<List<MenuItemDTO>> searchMenuItems(@RequestParam("keyword") String keyword) {
        List<MenuItemDTO> items = menuService.searchMenuItems(keyword).stream()
                .map(this::mapMenuItemToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(items);
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<MenuItemDTO> updateMenuItem(
            @PathVariable("id") Long id, @RequestBody MenuItemDTO dto) {
        MenuItem updateData = new MenuItem();
        updateData.setName(dto.getName());
        updateData.setDescription(dto.getDescription());
        updateData.setPrice(dto.getPrice());
        updateData.setDiscountedPrice(dto.getDiscountedPrice());
        updateData.setPreparationTime(dto.getPreparationTime());
        updateData.setIsAvailable(dto.getIsAvailable());
        updateData.setImageUrl(dto.getImageUrl());

        MenuItem updated = menuService.updateMenuItem(id, updateData);
        return ResponseEntity.ok(mapMenuItemToDTO(updated));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable("id") Long id) {
        menuService.deleteMenuItem(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/items/{id}/availability")
    public ResponseEntity<Void> updateItemAvailability(
            @PathVariable("id") Long id, @RequestParam("isAvailable") Boolean isAvailable) {
        menuService.updateItemAvailability(id, isAvailable);
        return ResponseEntity.ok().build();
    }

    // ==================== Helper Mapping ====================

    private CategoryDTO mapCategoryToDTO(Category entity) {
        return CategoryDTO.builder()
                .id(entity.getId())
                .restaurantId(entity.getRestaurantId())
                .name(entity.getName())
                .description(entity.getDescription())
                .displayOrder(entity.getDisplayOrder())
                .isActive(entity.getIsActive())
                .imageUrl(entity.getImageUrl())
                .build();
    }

    private MenuItemDTO mapMenuItemToDTO(MenuItem entity) {
        return MenuItemDTO.builder()
                .id(entity.getId())
                .restaurantId(entity.getRestaurantId())
                .categoryId(entity.getCategoryId())
                .name(entity.getName())
                .description(entity.getDescription())
                .price(entity.getPrice())
                .discountedPrice(entity.getDiscountedPrice())
                .isAvailable(entity.getIsAvailable())
                .preparationTime(entity.getPreparationTime())
                .orderCount(entity.getOrderCount())
                .rating(entity.getRating())
                .isVegetarian(entity.getIsVegetarian())
                .isSpicy(entity.getIsSpicy())
                .imageUrl(entity.getImageUrl())
                .build();
    }
}
