package com.campusnexus.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "system_metadata")
public class SystemMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "key_name", nullable = false, unique = true, length = 100)
    private String keyName;

    @Column(name = "value", nullable = false, length = 255)
    private String value;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public SystemMetadata() {
    }

    public SystemMetadata(String keyName, String value) {
        this.keyName = keyName;
        this.value = value;
    }

    public SystemMetadata(Long id, String keyName, String value, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.keyName = keyName;
        this.value = value;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getKeyName() {
        return keyName;
    }

    public void setKeyName(String keyName) {
        this.keyName = keyName;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SystemMetadata that = (SystemMetadata) o;
        return Objects.equals(id, that.id) || (id == null && Objects.equals(keyName, that.keyName));
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, keyName);
    }

    @Override
    public String toString() {
        return "SystemMetadata{" +
                "id=" + id +
                ", keyName='" + keyName + '\'' +
                ", value='" + value + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
