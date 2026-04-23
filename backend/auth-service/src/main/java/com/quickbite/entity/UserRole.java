package com.quickbite.entity;

public enum UserRole {
    GUEST("GUEST", "Unauthenticated visitor"),
    CUSTOMER("CUSTOMER", "Customer who places orders"),
    RESTAURANT_OWNER("RESTAURANT_OWNER", "Restaurant owner/merchant"),
    DELIVERY_AGENT("DELIVERY_AGENT", "Delivery agent/rider"),
    ADMIN("ADMIN", "Platform administrator"),
    APPLICATION_ADMIN("APPLICATION_ADMIN", "Application administrator with platform-wide control");

    private final String code;
    private final String description;

    UserRole(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public static UserRole fromCode(String code) {
        for (UserRole role : values()) {
            if (role.code.equals(code)) {
                return role;
            }
        }
        throw new IllegalArgumentException("Invalid role code: " + code);
    }
}
