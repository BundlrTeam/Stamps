# Graph Report - Stamps  (2026-06-15)

## Corpus Check
- 69 files · ~33,622 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 493 nodes · 606 edges · 60 communities (39 shown, 21 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b2b55c0c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

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
- [[_COMMUNITY_Subsystem 42|Subsystem 42]]
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
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]

## God Nodes (most connected - your core abstractions)
1. `BusinessService` - 35 edges
2. `StampCard` - 23 edges
3. `ProfilePage` - 22 edges
4. `StampCardPage` - 19 edges
5. `WalletPage` - 18 edges
6. `Business` - 16 edges
7. `Stamp Me UI/UX Revamp Implementation Plan` - 14 edges
8. `Professional Mockup Upgrade Implementation Plan` - 13 edges
9. `BusinessDetailPage` - 11 edges
10. `HomePage` - 11 edges

## Surprising Connections (you probably didn't know these)
- `CapApp-SPM Package Configuration` --shares_data_with--> `dependencies`  [INFERRED]
  ios/App/CapApp-SPM/Package.swift → package.json
- `Karma Test Runner Configuration` --conceptually_related_to--> `dependencies`  [INFERRED]
  karma.conf.js → package.json
- `Angular Configuration` --conceptually_related_to--> `Ionic Config JSON`  [INFERRED]
  angular.json → ionic.config.json
- `Ionic Config JSON` --conceptually_related_to--> `Capacitor Config TS`  [INFERRED]
  ionic.config.json → capacitor.config.ts
- `TabsPageRoutingModule` --references--> `HomePageModule`  [EXTRACTED]
  src/app/tabs/tabs-routing.module.ts → src/app/pages/home/home.module.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Angular Application Modules** — app_app_module_appmodule, explore_container_explore_container_module_explorecontainercomponentmodule, business_detail_business_detail_module_businessdetailpagemodule [INFERRED 0.85]
- **Main App Navigation Flow** — tabs_tabs_page_html, home_home_page_html, wallet_wallet_page_html, profile_profile_page_html [INFERRED 0.85]

## Communities (60 total, 21 thin omitted)

### Community 0 - "Angular Build Configuration"
Cohesion: 0.05
Nodes (43): architect, prefix, projectType, root, schematics, sourceRoot, build, extract-i18n (+35 more)

### Community 1 - "Business Detail View"
Cohesion: 0.08
Nodes (10): MOCK_BUSINESSES, Business, StampCard, StampReward, BusinessService, DemoState, WalletPageModule, WalletPage (+2 more)

### Community 2 - "Explore Container Component"
Cohesion: 0.06
Nodes (32): Chunk 1: Technical Credibility Cleanup, Chunk 2: Demo Data And Loyalty State, Chunk 3: Core Customer Experience Polish, Chunk 4: Profile And Merchant Interest Flow, Chunk 5: Visual System And Branding, Chunk 6: Packaging, Docs, And Native Metadata, Chunk 7: Final Verification And Presentation Readiness, Current Findings To Address (+24 more)

### Community 3 - "Build Dependencies"
Cohesion: 0.06
Nodes (32): enabled, cli, analytics, cache, schematicCollections, devDependencies, @angular/cli, @angular/compiler-cli (+24 more)

### Community 4 - "User Profile Management"
Cohesion: 0.11
Nodes (6): MerchantLead, ProfilePageModule, ProfilePage, UserProfile, ProfilePageRoutingModule, routes

### Community 5 - "Angular Architecture and Framework Dependencies"
Cohesion: 0.05
Nodes (43): CapApp-SPM Package Configuration, Karma Test Runner Configuration, author, dependencies, @angular/animations, @angular/common, @angular/compiler, @angular/core (+35 more)

### Community 6 - "Project Configuration Metadata"
Cohesion: 0.06
Nodes (30): Chunk 1: Baseline Audit And Visual System, Chunk 2: Navigation, Shell, And Shared Patterns, Chunk 3: Home Marketplace Revamp, Chunk 4: Business Detail Revamp, Chunk 5: Wallet And Loyalty Progress Revamp, Chunk 6: Profile And Merchant Flow Revamp, Chunk 7: Accessibility, Copy, And Dark Mode, Chunk 8: Visual QA And Completion (+22 more)

### Community 7 - "iOS Application Delegate Lifecycle"
Cohesion: 0.14
Nodes (11): Any, AppDelegate, Bool, NSUserActivity, UIApplication, UIApplicationDelegate, UIResponder, UIUserActivityRestoring (+3 more)

### Community 8 - "Stamp Card Rewards Management"
Cohesion: 0.09
Nodes (11): styleext, styleext, newProjectRoot, $schema, schematics, @ionic/angular-toolkit:component, @ionic/angular-toolkit:page, version (+3 more)

### Community 9 - "Tabs Layout and Routing"
Cohesion: 0.33
Nodes (6): StampCardPageModule, TabsPageModule, TabsPage Spec, TabsPage, routes, TabsPageRoutingModule

### Community 10 - "Angular Build Output Assets"
Cohesion: 0.26
Nodes (12): options, assets, index, inlineStyleLanguage, karmaConfig, main, outputPath, polyfills (+4 more)

### Community 11 - "Core Application Shell and Routing"
Cohesion: 0.31
Nodes (6): AppComponent, AppComponent Unit Tests, AppModule, AppRoutingModule, routes, Main Entrypoint

### Community 12 - "Home Feed and Search Filters"
Cohesion: 0.20
Nodes (5): HomePageModule, Category, HomePage, HomePageRoutingModule, routes

### Community 13 - "Page Template Views"
Cohesion: 0.40
Nodes (6): Business Detail Page Template, Home Page Template, Profile Page Template, Stamp Card Page Template, Tabs Page Template, Wallet Page Template

### Community 14 - "Ionic Component Generators"
Cohesion: 0.33
Nodes (4): BusinessDetailPageModule, BusinessDetailPage, BusinessDetailPageRoutingModule, routes

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
Cohesion: 0.67
Nodes (3): Angular Configuration, Capacitor Config TS, Ionic Config JSON

### Community 42 - "Subsystem 42"
Cohesion: 0.20
Nodes (9): 1. Início, 2. Search And Filter, 3. Business Detail, 4. Carteira, 5. Cartão, 6. Visit Validation, 7. Perfil And Merchant Interest, Stamp Me Demo Script (+1 more)

### Community 57 - "Community 57"
Cohesion: 0.29
Nodes (4): LoginPageModule, LoginPage, LoginPageRoutingModule, routes

### Community 58 - "Community 58"
Cohesion: 0.25
Nodes (7): Current Demo Scope, Demo Notes, Development, Known Mock Limitations, Main Routes, Mobile Shell, Stamp Me

### Community 59 - "Community 59"
Cohesion: 0.40
Nodes (4): Baseline, Final QA Checklist, Implementation Notes, Stamp Me UI/UX Audit

## Knowledge Gaps
- **227 isolated node(s):** `root`, `ignorePatterns`, `overrides`, `recommendations`, `typescript.preferences.autoImportFileExcludePatterns` (+222 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Build Dependencies` to `Angular Architecture and Framework Dependencies`?**
  _High betweenness centrality (0.140) - this node is a cross-community bridge._
- **Why does `cli` connect `Build Dependencies` to `Stamp Card Rewards Management`?**
  _High betweenness centrality (0.138) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `dependencies` (e.g. with `CapApp-SPM Package Configuration` and `Karma Test Runner Configuration`) actually correct?**
  _`dependencies` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `root`, `ignorePatterns`, `overrides` to the rest of the system?**
  _227 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Angular Build Configuration` be split into smaller, more focused modules?**
  _Cohesion score 0.05094130675526024 - nodes in this community are weakly interconnected._
- **Should `Business Detail View` be split into smaller, more focused modules?**
  _Cohesion score 0.08272859216255443 - nodes in this community are weakly interconnected._
- **Should `Explore Container Component` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._