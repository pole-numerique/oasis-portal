package org.oasis_eu.portal.core.mongo.model.geo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.joda.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.TextIndexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.Language;

@Document(collection = "geographical_area")
@CompoundIndexes({
        @CompoundIndex(name = "lang_name", def = "{'lang':1, 'name':1}")
})
public class GeographicalArea {

    @Id
    private String id;

    /** language used for the name */
    private String lang;

    @Language
    private String ftsLanguage;
    
    /** displayed ; in current locale */
    @JsonProperty
    @TextIndexed
    private String name;

    /** to help the user discriminate, built using names of NUTS3 or else 2 parent with country */
    @Field("detailed_name")
    @JsonProperty
    private String detailedName;

    /** URI in Datacore (required if ex. sending directly to store ajax) */
    @JsonProperty
    private String uri;

    @JsonIgnore
    @Indexed
    private GeographicalAreaReplicationStatus status = GeographicalAreaReplicationStatus.INCOMING;

    @JsonIgnore
    private Instant replicationTime = Instant.now();

    public GeographicalArea() {
        
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDetailedName() {
        return detailedName;
    }

    public void setDetailedName(String detailedName) {
        this.detailedName = detailedName;
    }

    public String getUri() {
        return uri;
    }

    public void setUri(String uri) {
        this.uri = uri;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getLang() {
        return lang;
    }

    public void setLang(String lang) {
        this.lang = lang;
    }

    public GeographicalAreaReplicationStatus getStatus() {
        return status;
    }

    public void setStatus(GeographicalAreaReplicationStatus status) {
        this.status = status;
    }

    public Instant getReplicationTime() {
        return replicationTime;
    }

    public void setReplicationTime(Instant replicationTime) {
        this.replicationTime = replicationTime;
    }

    public String getFtsLanguage() {
        return ftsLanguage;
    }

    public void setFtsLanguage(String ftsLanguage) {
        this.ftsLanguage = ftsLanguage;
    }
}
