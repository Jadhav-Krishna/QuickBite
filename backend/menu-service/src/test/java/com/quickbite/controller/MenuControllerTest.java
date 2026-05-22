package com.quickbite.controller;

import com.quickbite.dto.CategoryDTO;
import com.quickbite.dto.MenuItemDTO;
import com.quickbite.entity.Category;
import com.quickbite.entity.MenuItem;
import com.quickbite.exception.ResourceNotFoundException;
import com.quickbite.service.CloudinaryService;
import com.quickbite.service.MenuService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MenuControllerTest {

    @Mock private MenuService menuService;
    @Mock private CloudinaryService cloudinaryService;
    @Mock private MultipartFile file;

    @InjectMocks private MenuController menuController;

    private Category category;
    private MenuItem menuItem;

    @BeforeEach
    void setup() {
        category = new Category();
        category.setId(1L);
        category.setRestaurantId(1L);
        category.setName("Pizza");
        category.setDescription("Italian Pizza");
        category.setDisplayOrder(1);
        category.setIsActive(true);

        menuItem = new MenuItem();
        menuItem.setId(1L);
        menuItem.setRestaurantId(1L);
        menuItem.setCategoryId(1L);
        menuItem.setName("Margherita");
        menuItem.setDescription("Classic pizza");
        menuItem.setPrice(100.0);
        menuItem.setDiscountedPrice(90.0);
        menuItem.setIsAvailable(true);
        menuItem.setPreparationTime(15);
        menuItem.setIsVegetarian(true);
        menuItem.setIsSpicy(false);
        menuItem.setOrderCount(10);
        menuItem.setRating(4.5);
    }

    @Test
    void createCategory_success() {
        CategoryDTO dto = CategoryDTO.builder()
                .restaurantId(1L)
                .name("Pizza")
                .description("Italian Pizza")
                .displayOrder(1)
                .build();

        when(menuService.createCategory(anyLong(), anyString(), anyString(), anyInt()))
                .thenReturn(category);

        ResponseEntity<CategoryDTO> response = menuController.createCategory(dto);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Pizza", response.getBody().getName());
    }

    @Test
    void getRestaurantCategories_success() {
        when(menuService.getRestaurantCategories(1L)).thenReturn(List.of(category));

        ResponseEntity<List<CategoryDTO>> response = menuController.getRestaurantCategories(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void updateCategory_success() {
        CategoryDTO dto = CategoryDTO.builder()
                .name("Updated Pizza")
                .build();

        category.setName("Updated Pizza");
        when(menuService.updateCategory(eq(1L), any(Category.class))).thenReturn(category);

        ResponseEntity<CategoryDTO> response = menuController.updateCategory(1L, dto);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Updated Pizza", response.getBody().getName());
    }

    @Test
    void deleteCategory_success() {
        doNothing().when(menuService).deleteCategory(1L);

        ResponseEntity<Void> response = menuController.deleteCategory(1L);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
    }

    @Test
    void createMenuItem_success() {
        MenuItemDTO dto = MenuItemDTO.builder()
                .restaurantId(1L)
                .categoryId(1L)
                .name("Margherita")
                .description("Classic pizza")
                .price(100.0)
                .discountedPrice(90.0)
                .preparationTime(15)
                .isVegetarian(true)
                .isSpicy(false)
                .build();

        when(menuService.createMenuItem(eq(1L), eq(1L), eq("Margherita"), eq("Classic pizza"),
                eq(100.0), eq(90.0), eq(15), eq(true), eq(false)))
                .thenReturn(menuItem);

        ResponseEntity<MenuItemDTO> response = menuController.createMenuItem(dto);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals("Margherita", response.getBody().getName());
    }

    @Test
    void getAllMenuItems_success() {
        when(menuService.getAllMenuItems()).thenReturn(List.of(menuItem));

        ResponseEntity<List<MenuItemDTO>> response = menuController.getAllMenuItems();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void getMenuItem_success() {
        when(menuService.getMenuItem(1L)).thenReturn(menuItem);

        ResponseEntity<MenuItemDTO> response = menuController.getMenuItem(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Margherita", response.getBody().getName());
    }

    @Test
    void getRestaurantMenu_success() {
        when(menuService.getRestaurantMenu(1L)).thenReturn(List.of(menuItem));

        ResponseEntity<List<MenuItemDTO>> response = menuController.getRestaurantMenu(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void getCategoryItems_success() {
        when(menuService.getCategoryItems(1L)).thenReturn(List.of(menuItem));

        ResponseEntity<List<MenuItemDTO>> response = menuController.getCategoryItems(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void getAvailableItems_success() {
        when(menuService.getAvailableItems(1L)).thenReturn(List.of(menuItem));

        ResponseEntity<List<MenuItemDTO>> response = menuController.getAvailableItems(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void getVegetarianItems_success() {
        when(menuService.getVegetarianItems(1L)).thenReturn(List.of(menuItem));

        ResponseEntity<List<MenuItemDTO>> response = menuController.getVegetarianItems(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void searchMenuItems_success() {
        when(menuService.searchMenuItems("pizza")).thenReturn(List.of(menuItem));

        ResponseEntity<List<MenuItemDTO>> response = menuController.searchMenuItems("pizza");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void updateMenuItem_success() {
        MenuItemDTO dto = MenuItemDTO.builder()
                .name("Updated Pizza")
                .price(120.0)
                .build();

        menuItem.setName("Updated Pizza");
        when(menuService.updateMenuItem(eq(1L), any(MenuItem.class))).thenReturn(menuItem);

        ResponseEntity<MenuItemDTO> response = menuController.updateMenuItem(1L, dto);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Updated Pizza", response.getBody().getName());
    }

    @Test
    void deleteMenuItem_success() {
        doNothing().when(menuService).deleteMenuItem(1L);

        ResponseEntity<Void> response = menuController.deleteMenuItem(1L);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
    }

    @Test
    void updateItemAvailability_success() {
        doNothing().when(menuService).updateItemAvailability(1L, false);

        ResponseEntity<Void> response = menuController.updateItemAvailability(1L, false);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void uploadMenuItemImage_success() {
        menuItem.setImageUrl("old-url");
        when(menuService.getMenuItem(1L)).thenReturn(menuItem);
        when(cloudinaryService.uploadImage(file, "menu-items")).thenReturn("new-image-url");
        when(menuService.updateMenuItem(eq(1L), any(MenuItem.class))).thenReturn(menuItem);

        ResponseEntity<String> response = menuController.uploadMenuItemImage(1L, file);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("new-image-url", response.getBody());
    }

    @Test
    void uploadMenuItemImage_failure() {
        when(menuService.getMenuItem(1L)).thenThrow(new ResourceNotFoundException("Item not found"));

        ResponseEntity<String> response = menuController.uploadMenuItemImage(1L, file);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void deleteMenuItemImage_success() {
        menuItem.setImageUrl("image-url");
        when(menuService.getMenuItem(1L)).thenReturn(menuItem);
        doNothing().when(cloudinaryService).deleteImage("image-url");
        when(menuService.updateMenuItem(eq(1L), any(MenuItem.class))).thenReturn(menuItem);

        ResponseEntity<Void> response = menuController.deleteMenuItemImage(1L);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
    }

    @Test
    void deleteMenuItemImage_failure() {
        when(menuService.getMenuItem(1L)).thenThrow(new RuntimeException("Error"));

        ResponseEntity<Void> response = menuController.deleteMenuItemImage(1L);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }
}
