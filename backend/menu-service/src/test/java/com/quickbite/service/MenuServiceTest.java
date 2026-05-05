package com.quickbite.service;

import com.quickbite.entity.Category;
import com.quickbite.entity.MenuItem;
import com.quickbite.exception.InvalidRequestException;
import com.quickbite.exception.ResourceNotFoundException;
import com.quickbite.repository.CategoryRepository;
import com.quickbite.repository.MenuItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MenuServiceTest {

    @Mock private MenuItemRepository menuItemRepository;
    @Mock private CategoryRepository categoryRepository;

    @InjectMocks private MenuService menuService;

    private MenuItem item;
    private Category category;

    @BeforeEach
    void setup() {
        category = new Category();
        category.setId(1L);
        category.setRestaurantId(1L);
        category.setName("Pizza");

        item = new MenuItem();
        item.setId(1L);
        item.setRestaurantId(1L);
        item.setCategoryId(1L);
        item.setName("Margherita");
        item.setPrice(100.0);
        item.setDiscountedPrice(100.0);
        item.setIsAvailable(true);
        item.setIsVegetarian(true);
        item.setOrderCount(0);
    }

    // ================= CATEGORY =================

    @Test
    void createCategory_success() {
        when(categoryRepository.save(any())).thenReturn(category);

        Category result = menuService.createCategory(1L, "Pizza", "desc", 1);

        assertNotNull(result);
        verify(categoryRepository).save(any());
    }

    @Test
    void getRestaurantCategories_success() {
        when(categoryRepository.findByRestaurantIdAndIsActiveTrue(any()))
                .thenReturn(List.of(category));

        List<Category> result = menuService.getRestaurantCategories(1L);

        assertEquals(1, result.size());
    }

    @Test
    void updateCategory_success() {
        when(categoryRepository.findById(any())).thenReturn(Optional.of(category));
        when(categoryRepository.save(any())).thenReturn(category);

        Category update = new Category();
        update.setName("Updated");

        Category result = menuService.updateCategory(1L, update);

        assertEquals("Updated", result.getName());
    }

    @Test
    void updateCategory_notFound() {
        when(categoryRepository.findById(any())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> menuService.updateCategory(1L, new Category()));
    }

    @Test
    void deleteCategory_success() {
        menuService.deleteCategory(1L);
        verify(categoryRepository).deleteById(1L);
    }

    // ================= CREATE ITEM =================

    @Test
    void createMenuItem_success() {
        when(menuItemRepository.save(any())).thenReturn(item);

        MenuItem result = menuService.createMenuItem(
                1L, 1L, "Pizza", "desc",
                100.0, null, 10, true, false
        );

        assertNotNull(result);
    }

    @Test
    void createMenuItem_invalidCategory() {
        assertThrows(InvalidRequestException.class,
                () -> menuService.createMenuItem(
                        1L, null, "Pizza", "desc",
                        100.0, null, 10, true, false
                ));
    }

    @Test
    void createMenuItem_invalidPrice() {
        assertThrows(InvalidRequestException.class,
                () -> menuService.createMenuItem(
                        1L, 1L, "Pizza", "desc",
                        0.0, null, 10, true, false
                ));
    }

    // ================= GET =================

    @Test
    void getMenuItem_success() {
        when(menuItemRepository.findById(any())).thenReturn(Optional.of(item));

        MenuItem result = menuService.getMenuItem(1L);

        assertNotNull(result);
    }

    @Test
    void getMenuItem_notFound() {
        when(menuItemRepository.findById(any())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> menuService.getMenuItem(1L));
    }

    @Test
    void getAllMenuItems_success() {
        when(menuItemRepository.findAll()).thenReturn(List.of(item));

        assertEquals(1, menuService.getAllMenuItems().size());
    }

    @Test
    void getCategoryItems_success() {
        when(menuItemRepository.findByCategoryId(any()))
                .thenReturn(List.of(item));

        assertEquals(1, menuService.getCategoryItems(1L).size());
    }

    @Test
    void getAvailableItems_success() {
        when(menuItemRepository.findAvailableItemsByRestaurant(any()))
                .thenReturn(List.of(item));

        assertEquals(1, menuService.getAvailableItems(1L).size());
    }

    // ================= UPDATE =================

    @Test
    void updateMenuItem_success() {
        when(menuItemRepository.findById(any())).thenReturn(Optional.of(item));
        when(menuItemRepository.save(any())).thenReturn(item);

        MenuItem update = new MenuItem();
        update.setName("Updated");

        MenuItem result = menuService.updateMenuItem(1L, update);

        assertEquals("Updated", result.getName());
    }

    @Test
    void updateMenuItem_notFound() {
        when(menuItemRepository.findById(any())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> menuService.updateMenuItem(1L, new MenuItem()));
    }

    // ================= DELETE =================

    @Test
    void deleteMenuItem_success() {
        menuService.deleteMenuItem(1L);
        verify(menuItemRepository).deleteById(1L);
    }

    // ================= AVAILABILITY =================

    @Test
    void updateAvailability_success() {
        when(menuItemRepository.findById(any())).thenReturn(Optional.of(item));

        menuService.updateItemAvailability(1L, false);

        assertFalse(item.getIsAvailable());
    }

    // ================= ORDER COUNT =================

    @Test
    void incrementOrderCount_success() {
        when(menuItemRepository.findById(any())).thenReturn(Optional.of(item));

        menuService.incrementOrderCount(1L);

        assertEquals(1, item.getOrderCount());
    }

    // ================= FILTER =================

    @Test
    void getVegetarianItems_success() {
        when(menuItemRepository.findByRestaurantIdAndIsVegetarian(any(), eq(true)))
                .thenReturn(List.of(item));

        assertEquals(1, menuService.getVegetarianItems(1L).size());
    }

    @Test
    void searchMenuItems_success() {
        when(menuItemRepository.findByNameContainingIgnoreCase(any()))
                .thenReturn(List.of(item));

        assertEquals(1, menuService.searchMenuItems("pizza").size());
    }

    @Test
    void getRestaurantMenu_success() {
        when(menuItemRepository.findByRestaurantId(1L)).thenReturn(List.of(item));

        List<MenuItem> result = menuService.getRestaurantMenu(1L);

        assertEquals(1, result.size());
        verify(menuItemRepository).findByRestaurantId(1L);
    }

    @Test
    void updateItemAvailability_notFound() {
        when(menuItemRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> menuService.updateItemAvailability(1L, false));
    }

    @Test
    void incrementOrderCount_notFound() {
        when(menuItemRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> menuService.incrementOrderCount(1L));
    }

    @Test
    void createMenuItem_withDiscountedPrice() {
        when(menuItemRepository.save(any())).thenReturn(item);

        MenuItem result = menuService.createMenuItem(
                1L, 1L, "Pizza", "desc",
                100.0, 80.0, 10, true, false
        );

        assertNotNull(result);
        verify(menuItemRepository).save(any());
    }

    @Test
    void createMenuItem_nullPrice() {
        assertThrows(InvalidRequestException.class,
                () -> menuService.createMenuItem(
                        1L, 1L, "Pizza", "desc",
                        null, null, 10, true, false
                ));
    }

    @Test
    void updateCategory_allFields() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(categoryRepository.save(any())).thenReturn(category);

        Category update = new Category();
        update.setName("Updated");
        update.setDescription("New desc");
        update.setDisplayOrder(5);
        update.setIsActive(false);
        update.setImageUrl("image.jpg");

        Category result = menuService.updateCategory(1L, update);

        assertEquals("Updated", result.getName());
        assertEquals("New desc", result.getDescription());
        assertEquals(5, result.getDisplayOrder());
        assertEquals(false, result.getIsActive());
        assertEquals("image.jpg", result.getImageUrl());
    }

    @Test
    void updateMenuItem_allFields() {
        when(menuItemRepository.findById(1L)).thenReturn(Optional.of(item));
        when(menuItemRepository.save(any())).thenReturn(item);

        MenuItem update = new MenuItem();
        update.setName("Updated");
        update.setDescription("New desc");
        update.setPrice(150.0);
        update.setDiscountedPrice(130.0);
        update.setPreparationTime(20);
        update.setIsAvailable(false);
        update.setImageUrl("image.jpg");

        MenuItem result = menuService.updateMenuItem(1L, update);

        assertEquals("Updated", result.getName());
        assertEquals("New desc", result.getDescription());
        assertEquals(150.0, result.getPrice());
        assertEquals(130.0, result.getDiscountedPrice());
        assertEquals(20, result.getPreparationTime());
        assertEquals(false, result.getIsAvailable());
        assertEquals("image.jpg", result.getImageUrl());
    }
}