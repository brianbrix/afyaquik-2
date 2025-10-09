package com.afyaquik.hms.configuration.domain;

import com.afyaquik.hms.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "form_definitions", uniqueConstraints = {
        @UniqueConstraint(name = "uk_form_def_tenant_key", columnNames = {"tenant_id", "form_key"})
})
public class FormDefinition extends BaseEntity {

    @Column(name = "form_key", nullable = false, length = 64)
    private String formKey;

    @Lob
    @Column(name = "schema_json", nullable = false)
    private String schemaJson; // stored JSON string

    @Column(name = "version", nullable = false)
    private int version = 1;

    public String getFormKey() { return formKey; }
    public void setFormKey(String formKey) { this.formKey = formKey; }
    public String getSchemaJson() { return schemaJson; }
    public void setSchemaJson(String schemaJson) { this.schemaJson = schemaJson; }
    public int getVersion() { return version; }
    public void setVersion(int version) { this.version = version; }
}
