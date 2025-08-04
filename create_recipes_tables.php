<?php
require_once 'db_connection.php';

// Create recipes table
$create_recipes_table = "
CREATE TABLE IF NOT EXISTS recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    recipe_name VARCHAR(255) NOT NULL,
    recipe_description TEXT,
    total_cost DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id),
    INDEX idx_recipe_name (recipe_name)
)";

// Create recipe_materials table
$create_recipe_materials_table = "
CREATE TABLE IF NOT EXISTS recipe_materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT NOT NULL,
    material_id INT NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    unit_cost DECIMAL(10,2) DEFAULT 0.00,
    total_cost DECIMAL(10,2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES raw_materials(id) ON DELETE CASCADE,
    INDEX idx_recipe_id (recipe_id),
    INDEX idx_material_id (material_id)
)";

// Create production_recipes table to link productions with recipes
$create_production_recipes_table = "
CREATE TABLE IF NOT EXISTS production_recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    production_id INT NOT NULL,
    recipe_id INT NOT NULL,
    batch_quantity INT NOT NULL,
    total_material_cost DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (production_id) REFERENCES productions(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    INDEX idx_production_id (production_id),
    INDEX idx_recipe_id (recipe_id)
)";

// Add recipe_id column to productions table if it doesn't exist
$add_recipe_id_to_productions = "
ALTER TABLE productions 
ADD COLUMN recipe_id INT NULL AFTER product_id,
ADD FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE SET NULL,
ADD INDEX idx_recipe_id (recipe_id)";

try {
    // Execute table creation queries
    if (mysqli_query($conn, $create_recipes_table)) {
        echo "✅ Recipes table created successfully\n";
    } else {
        echo "❌ Error creating recipes table: " . mysqli_error($conn) . "\n";
    }

    if (mysqli_query($conn, $create_recipe_materials_table)) {
        echo "✅ Recipe materials table created successfully\n";
    } else {
        echo "❌ Error creating recipe materials table: " . mysqli_error($conn) . "\n";
    }

    if (mysqli_query($conn, $create_production_recipes_table)) {
        echo "✅ Production recipes table created successfully\n";
    } else {
        echo "❌ Error creating production recipes table: " . mysqli_error($conn) . "\n";
    }

    // Try to add recipe_id column to productions table
    if (mysqli_query($conn, $add_recipe_id_to_productions)) {
        echo "✅ Recipe ID column added to productions table\n";
    } else {
        // Column might already exist
        echo "ℹ️ Recipe ID column already exists or couldn't be added: " . mysqli_error($conn) . "\n";
    }

    echo "\n🎉 Recipe system tables created successfully!\n";
    echo "\nTable structure:\n";
    echo "- recipes: Stores product recipes\n";
    echo "- recipe_materials: Stores materials for each recipe\n";
    echo "- production_recipes: Links productions to recipes\n";
    echo "- productions: Now has recipe_id column\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

mysqli_close($conn);
?> 