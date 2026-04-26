package com.quickbite.service;

import com.quickbite.entity.Category;
import com.quickbite.entity.MenuItem;
import com.quickbite.repository.CategoryRepository;
import com.quickbite.repository.MenuItemRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
public class MenuService {

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Transactional
    public Category createCategory(Long restaurantId, String name, String description, Integer displayOrder) {
        Category category = new Category();
        category.setRestaurantId(restaurantId);
        category.setName(name);
        category.setDescription(description);
        category.setDisplayOrder(displayOrder);
        return categoryRepository.save(category);
    }

    @Transactional(readOnly = true)
    public List<Category> getRestaurantCategories(Long restaurantId) {
        return categoryRepository.findByRestaurantIdAndIsActiveTrue(restaurantId);
    }

    @Transactional
    public Category updateCategory(Long id, Category updateData) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        
        if (updateData.getName() != null) category.setName(updateData.getName());
        if (updateData.getDescription() != null) category.setDescription(updateData.getDescription());
        if (updateData.getDisplayOrder() != null) category.setDisplayOrder(updateData.getDisplayOrder());
        if (updateData.getIsActive() != null) category.setIsActive(updateData.getIsActive());
        if (updateData.getImageUrl() != null) category.setImageUrl(updateData.getImageUrl());
        
        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }

    @Transactional
    public MenuItem createMenuItem(Long restaurantId, Long categoryId, String name, String description,
                                   Double price, Double discountedPrice, Integer preparationTime,
                                   Boolean isVegetarian, Boolean isSpicy) {
        if (categoryId == null) {
            throw new RuntimeException("Category is required for menu item");
        }
        if (price == null || price <= 0) {
            throw new RuntimeException("Price must be greater than 0");
        }

        MenuItem item = new MenuItem();
        item.setRestaurantId(restaurantId);
        item.setCategoryId(categoryId);
        item.setName(name);
        item.setDescription(description);
        item.setPrice(price);
        item.setDiscountedPrice(discountedPrice != null ? discountedPrice : price);
        item.setPreparationTime(preparationTime);
        item.setIsVegetarian(isVegetarian);
        item.setIsSpicy(isSpicy != null ? isSpicy : false);
        return menuItemRepository.save(item);
    }

    @Transactional(readOnly = true)
    public List<MenuItem> getAllMenuItems() {
        return menuItemRepository.findAll();
    }

    @Transactional(readOnly = true)
    public MenuItem getMenuItem(Long id) {
        return menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));
    }

    @Transactional(readOnly = true)
    public List<MenuItem> getRestaurantMenu(Long restaurantId) {
        return menuItemRepository.findByRestaurantId(restaurantId);
    }

    @Transactional(readOnly = true)
    public List<MenuItem> getCategoryItems(Long categoryId) {
        return menuItemRepository.findByCategoryId(categoryId);
    }

    @Transactional(readOnly = true)
    public List<MenuItem> getAvailableItems(Long restaurantId) {
        return menuItemRepository.findAvailableItemsByRestaurant(restaurantId);
    }

    @Transactional
    public MenuItem updateMenuItem(Long id, MenuItem updateData) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        if (updateData.getName() != null) item.setName(updateData.getName());
        if (updateData.getDescription() != null) item.setDescription(updateData.getDescription());
        if (updateData.getPrice() != null) item.setPrice(updateData.getPrice());
        if (updateData.getDiscountedPrice() != null) item.setDiscountedPrice(updateData.getDiscountedPrice());
        if (updateData.getPreparationTime() != null) item.setPreparationTime(updateData.getPreparationTime());
        if (updateData.getIsAvailable() != null) item.setIsAvailable(updateData.getIsAvailable());
        if (updateData.getImageUrl() != null) item.setImageUrl(updateData.getImageUrl());

        return menuItemRepository.save(item);
    }

    @Transactional
    public void deleteMenuItem(Long id) {
        menuItemRepository.deleteById(id);
    }

    @Transactional
    public void updateItemAvailability(Long id, Boolean isAvailable) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));
        item.setIsAvailable(isAvailable);
        menuItemRepository.save(item);
    }

    @Transactional
    public void incrementOrderCount(Long id) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));
        item.setOrderCount(item.getOrderCount() + 1);
        menuItemRepository.save(item);
    }

    @Transactional(readOnly = true)
    public List<MenuItem> getVegetarianItems(Long restaurantId) {
        return menuItemRepository.findByRestaurantIdAndIsVegetarian(restaurantId, true);
    }

    @Transactional(readOnly = true)
    public List<MenuItem> searchMenuItems(String keyword) {
        // Need to add this method in repository
        return menuItemRepository.findByNameContainingIgnoreCase(keyword);
    }
}
