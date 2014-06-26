package org.oasis_eu.portal.front.store;

import org.oasis_eu.portal.core.dao.CatalogStore;
import org.oasis_eu.portal.core.model.appstore.Audience;
import org.oasis_eu.portal.front.generic.PortalController;
import org.oasis_eu.portal.model.MyNavigation;
import org.oasis_eu.portal.services.MyNavigationService;
import org.oasis_eu.portal.services.PortalAppstoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

/**
 * User: schambon
 * Date: 6/24/14
 */
@Controller
@RequestMapping("/appstore")
public class AppStoreController extends PortalController {

    @Autowired
    private MyNavigationService myNavigationService;

    @Autowired
    private PortalAppstoreService appstoreService;

    @ModelAttribute("navigation")
    public List<MyNavigation> getNavigation() {
        return myNavigationService.getNavigation(null); // TODO point nav towards the appstore
    }

    @RequestMapping(method = RequestMethod.GET, value = {"", "/"})
    public String main(Model model) {
        model.addAttribute("hits", appstoreService.getAll(Arrays.asList(Audience.CITIZENS)));

        return "appstore";
    }

    @RequestMapping(method = RequestMethod.POST, value="/search")
    public String search(Model model, @RequestParam String query, @RequestParam List<Audience> audience) {
        model.addAttribute("hits", appstoreService.getAll(audience));

        return "appstore::hits";
    }

    @RequestMapping(method=RequestMethod.GET, value={"/confirm/{appId}"})
    public String confirm(Model model, @PathVariable String appId) {

        model.addAttribute("app", appstoreService.getInfo(appId));

        return "appstore-confirmation::content";
    }


    @RequestMapping(method = RequestMethod.POST, value="/buy")
    public String buy(@RequestParam String appId) {
        appstoreService.buy(appId);
        return "redirect:/my/dashboard";
    }

}