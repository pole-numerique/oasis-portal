package org.oasis_eu.portal.front.my;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.oasis_eu.portal.core.mongo.model.sitemap.SiteMapEntry;
import org.oasis_eu.portal.core.mongo.model.sitemap.SiteMapMenuSet;
import org.oasis_eu.portal.front.generic.BaseAJAXServices;
import org.oasis_eu.portal.front.generic.i18nMessages;
import org.oasis_eu.portal.services.MyNavigationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.RequestContextUtils;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("my/api")
public class MyOzwilloAJAXServices extends BaseAJAXServices {

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private MyNavigationService navigationService;

    @GetMapping("/config")
    public Config getConfig(HttpServletRequest request) throws JsonProcessingException {
        // trad
        Locale locale = RequestContextUtils.getLocale(request);
        Map<String, Map<String, String>> i18n = new HashMap<>();
        i18n.put(locale.getLanguage(), i18nMessages.getI18n_all(locale, messageSource));

        Map<Integer, List<SiteMapEntry>> siteMapFooter = navigationService.getSiteMapFooter();

        return new Config(locale.getLanguage(), i18n, siteMapFooter);
    }


    public static class Config {
        @JsonProperty
        String language;

        @JsonProperty
        Map<String, Map<String, String>> i18n;

        @JsonProperty
        Map<Integer, List<SiteMapEntry>> siteMapFooter;

        public Config(String language, Map<String, Map<String, String>> i18n, Map<Integer, List<SiteMapEntry>> siteMapFooter) {
            this.language = language;
            this.i18n = i18n;
            this.siteMapFooter = siteMapFooter;
        }
    }

}
