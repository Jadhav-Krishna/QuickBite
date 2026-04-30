package com.quickbite.service;

import com.quickbite.dto.MenuItemDTO;
import com.quickbite.entity.MenuItem;
import com.quickbite.repository.MenuItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
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

    @InjectMocks
    private MenuService menuService;

    private MenuItem testMenuItem;

    @BeforeEach
    void setUp() {
        testMenuItem = new MenuItem();
        testMenuItem.setId(1L);
        testMenuItem.setName("Test Item");
        testMenuItem.setRestaurantId(1L);
        testMenuItem.setPrice(new BigDecimal("10.00"));
        testMenuItem.setIsAvailable(true);
    }

    @Test
    void getMenuItemById_Success() {
        when(menuItemRepository.findById(anyLong())).thenReturn(Optional.of(testMenuItem));

        MenuItemDTO result = menuService.getMenuItemById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(menuItemRepository).findById(1L);
    }

    @Test
    void getMenuItemsByRestaurant_Success() {
        when(menuItemRepository.findByRestaurantId(anyLong())).thenReturn(Arrays.asList(testMenuItem));

        List<MenuItemDTO> results = menuService.getMenuItemsByRestaurant(1L);

        assertNotNull(results);
        assertEquals(1, results.size());
    }

    @Test
    void createMenuItem_Success() {
        when(menuItemRepository.save(any(MenuItem.class))).thenReturn(testMenuItem);

        MenuItemDTO dto = new MenuItemDTO();
        dto.setName("New Item");
        dto.setRestaurantId(1L);
        dto.setPrice(new BigDecimal("15.00"));

        MenuItemDTO result = menuService.createMenuItem(dto);

        assertNotNull(result);
        verify(menuItemRepository).save(any(MenuItem.class));
    }

    @Test
    void updateMenuItem_Success() {
        when(menuItemRepository.findById(anyLong())).thenReturn(Optional.of(testMenuItem));
        when(menuItemRepository.save(any(MenuItem.class))).thenReturn(testMenuItem);

        MenuItemDTO updateDTO = new MenuItemDTO();
        updateDTO.setName("Updated Item");

        MenuItemDTO result = menuService.updateMenuItem(1L, updateDTO);

        assertNotNull(result);
        verify(menuItemRepository).save(any(MenuItem.class));
    }

    @Test
    void deleteMenuItem_Success() {
        when(menuItemRepository.existsById(anyLong())).thenReturn(true);
        doNothing().when(menuItemRepository).deleteById(anyLong());

        menuService.deleteMenuItem(1L);

        verify(menuItemRepository).deleteById(1L);
    }

    @Test
    void toggleAvailability_Success() {
        when(menuItemRepository.findById(anyLong())).thenReturn(Optional.of(testMenuItem));
        when(menuItemRepository.save(any(MenuItem.class))).thenReturn(testMenuItem);

        menuService.toggleAvailability(1L);

        verify(menuItemRepository).save(argThat(item -> !item.getIsAvailable()));
    }
}
