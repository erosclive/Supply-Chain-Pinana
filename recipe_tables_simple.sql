-- Recipe System Database Tables (Simplified Version)
-- Run these queries in phpMyAdmin to set up the recipe system

-- 1. Create recipes table
CREATE TABLE IF NOT EXISTS `recipes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `recipe_name` varchar(255) NOT NULL,
  `recipe_description` text,
  `total_cost` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_recipe_name` (`recipe_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Create recipe_materials table
CREATE TABLE IF NOT EXISTS `recipe_materials` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `recipe_id` int(11) NOT NULL,
  `material_id` int(11) NOT NULL,
  `quantity` decimal(10,3) NOT NULL,
  `unit` varchar(50) NOT NULL,
  `unit_cost` decimal(10,2) DEFAULT 0.00,
  `total_cost` decimal(10,2) DEFAULT 0.00,
  `notes` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_recipe_id` (`recipe_id`),
  KEY `idx_material_id` (`material_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create production_recipes table
CREATE TABLE IF NOT EXISTS `production_recipes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `production_id` int(11) NOT NULL,
  `recipe_id` int(11) NOT NULL,
  `batch_quantity` int(11) NOT NULL,
  `total_material_cost` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_production_id` (`production_id`),
  KEY `idx_recipe_id` (`recipe_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Add recipe_id column to productions table (run this separately if it fails)
ALTER TABLE `productions` ADD COLUMN `recipe_id` int(11) NULL AFTER `product_id`;

-- 5. Add indexes for better performance
CREATE INDEX `idx_recipes_product_name` ON `recipes`(`recipe_name`);
CREATE INDEX `idx_recipe_materials_recipe_material` ON `recipe_materials`(`recipe_id`, `material_id`);
CREATE INDEX `idx_production_recipes_production_recipe` ON `production_recipes`(`production_id`, `recipe_id`);

-- 6. Verify tables were created successfully
SHOW TABLES LIKE 'recipes';
SHOW TABLES LIKE 'recipe_materials';
SHOW TABLES LIKE 'production_recipes';

-- 7. Check if recipe_id column was added to productions table
DESCRIBE `productions`; 