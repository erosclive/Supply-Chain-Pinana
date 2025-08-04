-- Recipe System Database Tables
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
  KEY `idx_recipe_name` (`recipe_name`),
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
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
  KEY `idx_material_id` (`material_id`),
  FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`material_id`) REFERENCES `raw_materials`(`id`) ON DELETE CASCADE
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
  KEY `idx_recipe_id` (`recipe_id`),
  FOREIGN KEY (`production_id`) REFERENCES `productions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Add recipe_id column to productions table
ALTER TABLE `productions` 
ADD COLUMN `recipe_id` int(11) NULL AFTER `product_id`,
ADD FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON DELETE SET NULL,
ADD INDEX `idx_recipe_id` (`recipe_id`);

-- 5. Insert sample recipe data (optional - for testing)
-- Uncomment the lines below if you want to add sample data

/*
-- Sample recipe for testing
INSERT INTO `recipes` (`product_id`, `recipe_name`, `recipe_description`, `total_cost`) 
SELECT p.id, CONCAT(p.name, ' Recipe'), CONCAT('Standard recipe for ', p.name), 0.00
FROM `products` p 
WHERE p.id = (SELECT MIN(id) FROM `products`)
LIMIT 1;

-- Sample recipe materials (if you have materials in raw_materials table)
INSERT INTO `recipe_materials` (`recipe_id`, `material_id`, `quantity`, `unit`, `unit_cost`, `total_cost`, `notes`)
SELECT 
    r.id as recipe_id,
    rm.id as material_id,
    1.00 as quantity,
    'kg' as unit,
    10.00 as unit_cost,
    10.00 as total_cost,
    'Sample material for testing' as notes
FROM `recipes` r
CROSS JOIN `raw_materials` rm
WHERE r.id = (SELECT MAX(id) FROM `recipes`)
AND rm.id = (SELECT MIN(id) FROM `raw_materials`)
LIMIT 1;
*/

-- 6. Create indexes for better performance
CREATE INDEX `idx_recipes_product_name` ON `recipes`(`recipe_name`);
CREATE INDEX `idx_recipe_materials_recipe_material` ON `recipe_materials`(`recipe_id`, `material_id`);
CREATE INDEX `idx_production_recipes_production_recipe` ON `production_recipes`(`production_id`, `recipe_id`);

-- 7. Verify tables were created successfully
-- Run this query to check if all tables exist
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    CREATE_TIME
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME IN ('recipes', 'recipe_materials', 'production_recipes')
ORDER BY TABLE_NAME;

-- 8. Check if recipe_id column was added to productions table
-- Run this query to verify the column was added
DESCRIBE `productions`;

-- 9. Show foreign key relationships
-- Run this query to see all foreign key constraints
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE 
WHERE REFERENCED_TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME IN ('recipes', 'recipe_materials', 'production_recipes', 'productions')
ORDER BY TABLE_NAME, CONSTRAINT_NAME; 