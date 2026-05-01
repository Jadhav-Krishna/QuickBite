package com.quickbite.service;

import com.quickbite.entity.MenuItem;
import com.quickbite.repository.CategoryRepository;
import com.quickbite.repository.MenuItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MenuServiceTest {

    @Mock
    private MenuItemRepository menuItemRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private MenuService menuService;

    private MenuItem testMenuItem;

    @BeforeEach
    void setUp() {
        testMenuItem = new MenuItem();
        testMenuItem.setId(1L);
        testMenuItem.setName("Test Item");
        testMenuItem.setRestaurantId(1L);
        testMenuItem.setCategoryId(1L);
        testMenuItem.setPrice(10.0);
        testMenuItem.setDiscountedPrice(10.0);
        testMenuItem.setIsAvailable(true);
        testMenuItem.setIsVegetarian(true);
        testMenuItem.setIsSpicy(false);
        testMenuItem.setPreparationTime(15);
        testMenuItem.setOrderCount(0);
    }

    @Test
    void getMenuItemById_Success() {
        when(menuItemRepository.findById(anyLong())).thenReturn(Optional.of(testMenuItem));

        MenuItem result = menuService.getMenuItem(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(menuItemRepository).findById(1L);
    }

    @Test
    void getMenuItemsByRestaurant_Success() {
        when(menuItemRepository.findByRestaurantId(anyLong())).thenReturn(Arrays.asList(testMenuItem));

        List<MenuItem> results = menuService.getRestaurantMenu(1L);

        assertNotNull(results);
        assertEquals(1, results.size());
    }

    @Test
    void updateMenuItem_Success() {
        when(menuItemRepository.findById(anyLong())).thenReturn(Optional.of(testMenuItem));
        when(menuItemRepository.save(any(MenuItem.class))).thenReturn(testMenuItem);

        MenuItem updateData = new MenuItem();
        updateData.setName("Updated Item");

        MenuItem result = menuService.updateMenuItem(1L, updateData);

        assertNotNull(result);
        verify(menuItemRepository).save(any(MenuItem.class));
    }

    @Test
    void deleteMenuItem_Success() {
        doNothing().when(menuItemRepository).deleteById(anyLong());

        menuService.deleteMenuItem(1L);

        verify(menuItemRepository).deleteById(1L);
    }

    @Test
    void updateItemAvailability_Success() {
        when(menuItemRepository.findById(anyLong())).thenReturn(Optional.of(testMenuItem));
        when(menuItemRepository.save(any(MenuItem.class))).thenReturn(testMenuItem);

        menuService.updateItemAvailability(1L, false);

        verify(menuItemRepository).save(argThat(item -> !item.getIsAvailable()));
    }
}
