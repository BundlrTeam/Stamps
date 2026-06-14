# Graph Report - .  (2026-06-14)

## Corpus Check
- Corpus is ~24,015 words - fits in a single context window. You may not need a graph.

## Summary
- 400 nodes · 511 edges · 57 communities (36 shown, 21 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Angular Build Configuration|Angular Build Configuration]]
- [[_COMMUNITY_Business Detail View|Business Detail View]]
- [[_COMMUNITY_Explore Container Component|Explore Container Component]]
- [[_COMMUNITY_Build Dependencies|Build Dependencies]]
- [[_COMMUNITY_User Profile Management|User Profile Management]]
- [[_COMMUNITY_Angular Architecture and Framework Dependencies|Angular Architecture and Framework Dependencies]]
- [[_COMMUNITY_Project Configuration Metadata|Project Configuration Metadata]]
- [[_COMMUNITY_iOS Application Delegate Lifecycle|iOS Application Delegate Lifecycle]]
- [[_COMMUNITY_Stamp Card Rewards Management|Stamp Card Rewards Management]]
- [[_COMMUNITY_Tabs Layout and Routing|Tabs Layout and Routing]]
- [[_COMMUNITY_Angular Build Output Assets|Angular Build Output Assets]]
- [[_COMMUNITY_Core Application Shell and Routing|Core Application Shell and Routing]]
- [[_COMMUNITY_Home Feed and Search Filters|Home Feed and Search Filters]]
- [[_COMMUNITY_Page Template Views|Page Template Views]]
- [[_COMMUNITY_Ionic Component Generators|Ionic Component Generators]]
- [[_COMMUNITY_Subsystem 15|Subsystem 15]]
- [[_COMMUNITY_Subsystem 16|Subsystem 16]]
- [[_COMMUNITY_Subsystem 17|Subsystem 17]]
- [[_COMMUNITY_Subsystem 18|Subsystem 18]]
- [[_COMMUNITY_Subsystem 19|Subsystem 19]]
- [[_COMMUNITY_Subsystem 20|Subsystem 20]]
- [[_COMMUNITY_Subsystem 21|Subsystem 21]]
- [[_COMMUNITY_Subsystem 22|Subsystem 22]]
- [[_COMMUNITY_Subsystem 23|Subsystem 23]]
- [[_COMMUNITY_Subsystem 24|Subsystem 24]]
- [[_COMMUNITY_Subsystem 25|Subsystem 25]]
- [[_COMMUNITY_Subsystem 26|Subsystem 26]]
- [[_COMMUNITY_Subsystem 28|Subsystem 28]]
- [[_COMMUNITY_Subsystem 29|Subsystem 29]]
- [[_COMMUNITY_Subsystem 31|Subsystem 31]]
- [[_COMMUNITY_Subsystem 32|Subsystem 32]]
- [[_COMMUNITY_Subsystem 33|Subsystem 33]]
- [[_COMMUNITY_Subsystem 38|Subsystem 38]]
- [[_COMMUNITY_Subsystem 41|Subsystem 41]]
- [[_COMMUNITY_Subsystem 44|Subsystem 44]]
- [[_COMMUNITY_Subsystem 46|Subsystem 46]]
- [[_COMMUNITY_Subsystem 48|Subsystem 48]]
- [[_COMMUNITY_Subsystem 49|Subsystem 49]]
- [[_COMMUNITY_Subsystem 51|Subsystem 51]]
- [[_COMMUNITY_Subsystem 52|Subsystem 52]]
- [[_COMMUNITY_Subsystem 53|Subsystem 53]]
- [[_COMMUNITY_Subsystem 54|Subsystem 54]]
- [[_COMMUNITY_Subsystem 55|Subsystem 55]]
- [[_COMMUNITY_Subsystem 56|Subsystem 56]]

## God Nodes (most connected - your core abstractions)
1. `BusinessService` - 28 edges
2. `ProfilePage` - 20 edges
3. `StampCardPage` - 14 edges
4. `Business` - 12 edges
5. `BusinessDetailPage` - 11 edges
6. `options` - 10 edges
7. `AppDelegate` - 10 edges
8. `HomePage` - 10 edges
9. `development` - 9 edges
10. `options` - 9 edges

## Surprising Connections (you probably didn't know these)
- `CapApp-SPM Package Configuration` --shares_data_with--> `dependencies`  [INFERRED]
  ios/App/CapApp-SPM/Package.swift → package.json
- `Karma Test Runner Configuration` --conceptually_related_to--> `dependencies`  [INFERRED]
  karma.conf.js → package.json
- `Angular Configuration` --conceptually_related_to--> `Ionic Config JSON`  [INFERRED]
  angular.json → ionic.config.json
- `Capacitor Config TS` --conceptually_related_to--> `Capacitor Config JSON`  [INFERRED]
  capacitor.config.ts → capacitor.config.json
- `Ionic Config JSON` --conceptually_related_to--> `Capacitor Config TS`  [INFERRED]
  ionic.config.json → capacitor.config.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Angular Application Modules** — app_app_module_appmodule, explore_container_explore_container_module_explorecontainercomponentmodule, business_detail_business_detail_module_businessdetailpagemodule [INFERRED 0.85]
- **Main App Navigation Flow** — tabs_tabs_page_html, home_home_page_html, wallet_wallet_page_html, profile_profile_page_html [INFERRED 0.85]

## Communities (57 total, 21 thin omitted)

### Community 0 - "Angular Build Configuration"
Cohesion: 0.05
Nodes (43): architect, prefix, projectType, root, schematics, sourceRoot, build, extract-i18n (+35 more)

### Community 1 - "Business Detail View"
Cohesion: 0.11
Nodes (12): BusinessDetailPageModule, BusinessDetailPage, BusinessDetailPageRoutingModule, routes, MOCK_BUSINESSES, Business, StampCard, StampReward (+4 more)

### Community 2 - "Explore Container Component"
Cohesion: 0.11
Nodes (20): newProjectRoot, $schema, version, ExploreContainerComponent, ExploreContainerComponent Unit Tests, ExploreContainerComponentModule, Tab1PageModule, Tab1Page (+12 more)

### Community 3 - "Build Dependencies"
Cohesion: 0.07
Nodes (30): cli, analytics, schematicCollections, devDependencies, @angular/cli, @angular/compiler-cli, @angular-devkit/build-angular, @angular-eslint/builder (+22 more)

### Community 4 - "User Profile Management"
Cohesion: 0.11
Nodes (5): NewBusinessData, ProfilePage, UserProfile, ProfilePageRoutingModule, routes

### Community 5 - "Angular Architecture and Framework Dependencies"
Cohesion: 0.09
Nodes (23): CapApp-SPM Package Configuration, Karma Test Runner Configuration, dependencies, @angular/animations, @angular/common, @angular/compiler, @angular/core, @angular/forms (+15 more)

### Community 6 - "Project Configuration Metadata"
Cohesion: 0.11
Nodes (18): author, description, homepage, keywords, license, name, private, repository (+10 more)

### Community 7 - "iOS Application Delegate Lifecycle"
Cohesion: 0.14
Nodes (11): Any, AppDelegate, Bool, NSUserActivity, UIApplication, UIApplicationDelegate, UIResponder, UIUserActivityRestoring (+3 more)

### Community 8 - "Stamp Card Rewards Management"
Cohesion: 0.15
Nodes (4): StampCardPageModule, StampCardPage, routes, StampCardPageRoutingModule

### Community 9 - "Tabs Layout and Routing"
Cohesion: 0.26
Nodes (8): HomePageModule, ProfilePageModule, TabsPageModule, TabsPage Spec, TabsPage, routes, TabsPageRoutingModule, WalletPageModule

### Community 10 - "Angular Build Output Assets"
Cohesion: 0.26
Nodes (12): options, assets, index, inlineStyleLanguage, karmaConfig, main, outputPath, polyfills (+4 more)

### Community 11 - "Core Application Shell and Routing"
Cohesion: 0.27
Nodes (6): AppComponent, AppComponent Unit Tests, AppModule, AppRoutingModule, routes, Main Entrypoint

### Community 12 - "Home Feed and Search Filters"
Cohesion: 0.23
Nodes (4): Category, HomePage, HomePageRoutingModule, routes

### Community 13 - "Page Template Views"
Cohesion: 0.40
Nodes (6): Business Detail Page Template, Home Page Template, Profile Page Template, Stamp Card Page Template, Tabs Page Template, Wallet Page Template

### Community 14 - "Ionic Component Generators"
Cohesion: 0.40
Nodes (5): styleext, styleext, schematics, @ionic/angular-toolkit:component, @ionic/angular-toolkit:page

### Community 15 - "Subsystem 15"
Cohesion: 0.40
Nodes (4): images, info, author, version

### Community 16 - "Subsystem 16"
Cohesion: 0.40
Nodes (4): integrations, capacitor, name, type

### Community 17 - "Subsystem 17"
Cohesion: 0.40
Nodes (4): images, info, author, version

### Community 20 - "Subsystem 20"
Cohesion: 0.50
Nodes (4): Android Build Gradle, Android Variables Gradle, Android App Build Gradle, Android App Capacitor Build Gradle

### Community 21 - "Subsystem 21"
Cohesion: 0.50
Nodes (3): info, author, version

### Community 23 - "Subsystem 23"
Cohesion: 0.50
Nodes (3): ignorePatterns, overrides, root

### Community 24 - "Subsystem 24"
Cohesion: 0.50
Nodes (4): Explore Container Template, Tab1 Page Template, Tab2 Page Template, Tab3 Page Template

### Community 25 - "Subsystem 25"
Cohesion: 0.50
Nodes (4): Angular Configuration, Capacitor Config JSON, Capacitor Config TS, Ionic Config JSON

## Knowledge Gaps
- **168 isolated node(s):** `root`, `ignorePatterns`, `overrides`, `recommendations`, `typescript.preferences.autoImportFileExcludePatterns` (+163 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Build Dependencies` to `Project Configuration Metadata`?**
  _High betweenness centrality (0.203) - this node is a cross-community bridge._
- **Why does `cli` connect `Build Dependencies` to `Explore Container Component`?**
  _High betweenness centrality (0.195) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `dependencies` (e.g. with `CapApp-SPM Package Configuration` and `Karma Test Runner Configuration`) actually correct?**
  _`dependencies` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `root`, `ignorePatterns`, `overrides` to the rest of the system?**
  _168 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Angular Build Configuration` be split into smaller, more focused modules?**
  _Cohesion score 0.05094130675526024 - nodes in this community are weakly interconnected._
- **Should `Business Detail View` be split into smaller, more focused modules?**
  _Cohesion score 0.10897435897435898 - nodes in this community are weakly interconnected._
- **Should `Explore Container Component` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._