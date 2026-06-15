# Graph Report - .  (2026-06-14)

## Corpus Check
- Corpus is ~24,295 words - fits in a single context window. You may not need a graph.

## Summary
- 368 nodes · 469 edges · 40 communities (32 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
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
- [[_COMMUNITY_Subsystem 24|Subsystem 24]]
- [[_COMMUNITY_Subsystem 25|Subsystem 25]]

## God Nodes (most connected - your core abstractions)
1. `BusinessService` - 25 edges
2. `ProfilePage` - 20 edges
3. `StampCardPage` - 16 edges
4. `Business` - 11 edges
5. `options` - 10 edges
6. `AppDelegate` - 10 edges
7. `development` - 9 edges
8. `options` - 9 edges
9. `StampCard` - 9 edges
10. `HomePage` - 9 edges

## Surprising Connections (you probably didn't know these)
- `HomePage` --references--> `Business`  [EXTRACTED]
  src/app/pages/home/home.page.ts → src/app/models/business.model.ts
- `StampCardPage` --references--> `StampCard`  [EXTRACTED]
  src/app/pages/stamp-card/stamp-card.page.ts → src/app/models/business.model.ts
- `BusinessDetailPage` --references--> `Business`  [EXTRACTED]
  src/app/pages/business-detail/business-detail.page.ts → src/app/models/business.model.ts
- `BusinessService` --references--> `Business`  [EXTRACTED]
  src/app/services/business.service.ts → src/app/models/business.model.ts
- `BusinessService` --references--> `StampCard`  [EXTRACTED]
  src/app/services/business.service.ts → src/app/models/business.model.ts

## Import Cycles
- None detected.

## Communities (40 total, 8 thin omitted)

### Community 0 - "Angular Build Configuration"
Cohesion: 0.04
Nodes (45): author, dependencies, @angular/animations, @angular/common, @angular/compiler, @angular/core, @angular/forms, @angular/platform-browser (+37 more)

### Community 1 - "Business Detail View"
Cohesion: 0.09
Nodes (14): BusinessDetailPageModule, BusinessDetailPage, BusinessDetailPageRoutingModule, routes, Category, MOCK_BUSINESSES, Business, StampCard (+6 more)

### Community 2 - "Explore Container Component"
Cohesion: 0.05
Nodes (43): architect, prefix, projectType, root, schematics, sourceRoot, build, extract-i18n (+35 more)

### Community 3 - "Build Dependencies"
Cohesion: 0.09
Nodes (22): styleext, styleext, newProjectRoot, $schema, schematics, @ionic/angular-toolkit:component, @ionic/angular-toolkit:page, version (+14 more)

### Community 4 - "User Profile Management"
Cohesion: 0.07
Nodes (30): cli, analytics, schematicCollections, devDependencies, @angular/cli, @angular/compiler-cli, @angular-devkit/build-angular, @angular-eslint/builder (+22 more)

### Community 5 - "Angular Architecture and Framework Dependencies"
Cohesion: 0.10
Nodes (6): ProfilePageModule, NewBusinessData, ProfilePage, UserProfile, ProfilePageRoutingModule, routes

### Community 6 - "Project Configuration Metadata"
Cohesion: 0.14
Nodes (11): Any, AppDelegate, Bool, NSUserActivity, UIApplication, UIApplicationDelegate, UIResponder, UIUserActivityRestoring (+3 more)

### Community 7 - "iOS Application Delegate Lifecycle"
Cohesion: 0.12
Nodes (4): StampCardPageModule, StampCardPage, routes, StampCardPageRoutingModule

### Community 8 - "Stamp Card Rewards Management"
Cohesion: 0.26
Nodes (12): options, assets, index, inlineStyleLanguage, karmaConfig, main, outputPath, polyfills (+4 more)

### Community 9 - "Tabs Layout and Routing"
Cohesion: 0.22
Nodes (4): HomePageModule, HomePage, HomePageRoutingModule, routes

### Community 10 - "Angular Build Output Assets"
Cohesion: 0.29
Nodes (4): AppComponent, AppModule, AppRoutingModule, routes

### Community 11 - "Core Application Shell and Routing"
Cohesion: 0.36
Nodes (4): TabsPageModule, TabsPage, routes, TabsPageRoutingModule

### Community 12 - "Home Feed and Search Filters"
Cohesion: 0.40
Nodes (4): images, info, author, version

### Community 13 - "Page Template Views"
Cohesion: 0.40
Nodes (4): integrations, capacitor, name, type

### Community 14 - "Ionic Component Generators"
Cohesion: 0.40
Nodes (4): images, info, author, version

### Community 17 - "Subsystem 17"
Cohesion: 0.50
Nodes (3): info, author, version

### Community 18 - "Subsystem 18"
Cohesion: 0.50
Nodes (3): ignorePatterns, overrides, root

## Knowledge Gaps
- **151 isolated node(s):** `root`, `ignorePatterns`, `overrides`, `recommendations`, `typescript.preferences.autoImportFileExcludePatterns` (+146 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `User Profile Management` to `Angular Build Configuration`?**
  _High betweenness centrality (0.252) - this node is a cross-community bridge._
- **Why does `cli` connect `User Profile Management` to `Build Dependencies`?**
  _High betweenness centrality (0.241) - this node is a cross-community bridge._
- **What connects `root`, `ignorePatterns`, `overrides` to the rest of the system?**
  _151 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Angular Build Configuration` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._
- **Should `Business Detail View` be split into smaller, more focused modules?**
  _Cohesion score 0.0919661733615222 - nodes in this community are weakly interconnected._
- **Should `Explore Container Component` be split into smaller, more focused modules?**
  _Cohesion score 0.05094130675526024 - nodes in this community are weakly interconnected._
- **Should `Build Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08902439024390243 - nodes in this community are weakly interconnected._