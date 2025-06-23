-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 23, 2025 at 01:13 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `supplychain_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `batch_history`
--

CREATE TABLE `batch_history` (
  `history_id` int(11) NOT NULL,
  `batch_id` int(11) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `batch_code` varchar(50) NOT NULL,
  `quantity_sold` decimal(10,2) NOT NULL,
  `manufacturing_date` date DEFAULT NULL,
  `expiration_date` date DEFAULT NULL,
  `unit_cost` decimal(10,2) DEFAULT NULL,
  `transaction_id` varchar(50) DEFAULT NULL,
  `moved_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `batch_history`
--

INSERT INTO `batch_history` (`history_id`, `batch_id`, `product_id`, `batch_code`, `quantity_sold`, `manufacturing_date`, `expiration_date`, `unit_cost`, `transaction_id`, `moved_at`, `notes`) VALUES
(1, 245, 'P036', '20250328-713', 5.00, '0000-00-00', '2025-05-28', 0.00, 'TRX-250328-73771', '2025-03-28 14:56:51', 'Batch depleted through order process'),
(2, 246, 'P036', '20250328-930', 10.00, '0000-00-00', '2025-05-28', 0.00, 'TRX-250328-27684', '2025-03-28 15:04:03', 'Batch depleted through order process'),
(3, 247, 'P036', '20250328-593', 20.00, '0000-00-00', '2025-05-28', 0.00, 'TRX-250328-70791', '2025-03-28 15:06:11', 'Batch depleted through order process'),
(4, 248, 'P036', '20250328-906', 5.00, '0000-00-00', '2025-05-28', 0.00, 'TRX-250328-79399', '2025-03-28 15:14:58', 'Batch depleted through order process'),
(5, 249, 'P036', '20250328-928', 15.00, '0000-00-00', '2025-05-28', 0.00, 'TRX-250328-58087', '2025-03-28 15:58:41', 'Batch depleted through order process');

-- --------------------------------------------------------

--
-- Table structure for table `deliveries`
--

CREATE TABLE `deliveries` (
  `delivery_id` int(11) NOT NULL,
  `order_id` varchar(20) NOT NULL,
  `estimated_delivery_time` datetime DEFAULT NULL,
  `actual_delivery_time` datetime DEFAULT NULL,
  `delivery_notes` text DEFAULT NULL,
  `driver_id` varchar(20) DEFAULT NULL,
  `rating` int(11) DEFAULT NULL,
  `feedback` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `delivery_issues`
--

CREATE TABLE `delivery_issues` (
  `issue_id` int(11) NOT NULL,
  `order_id` varchar(20) NOT NULL,
  `issue_type` enum('delay','damage','wrong_item','missing_item','other') NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('reported','investigating','resolved') NOT NULL DEFAULT 'reported',
  `reported_at` datetime NOT NULL,
  `resolved_at` datetime DEFAULT NULL,
  `resolution` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `equipment_usage`
--

CREATE TABLE `equipment_usage` (
  `id` int(11) NOT NULL,
  `production_id` int(11) NOT NULL,
  `production_step_id` int(11) DEFAULT NULL,
  `equipment_name` varchar(255) NOT NULL,
  `equipment_id` varchar(100) DEFAULT NULL,
  `usage_start` datetime NOT NULL,
  `usage_end` datetime DEFAULT NULL,
  `duration_minutes` int(11) DEFAULT NULL,
  `operator` varchar(255) DEFAULT NULL,
  `power_consumption_kwh` decimal(8,3) DEFAULT NULL,
  `maintenance_required` tinyint(1) DEFAULT 0,
  `efficiency_percentage` decimal(5,2) DEFAULT 100.00,
  `downtime_minutes` int(11) DEFAULT 0,
  `downtime_reason` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fixed_pineapple_supplier`
--

CREATE TABLE `fixed_pineapple_supplier` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `contact_info` varchar(255) NOT NULL,
  `farm_location` varchar(255) NOT NULL,
  `delivery_info` enum('Business Driver','Pick Up','Other') NOT NULL,
  `communication_mode` enum('Text','Call','WhatsApp','Other') NOT NULL,
  `notes` text DEFAULT NULL,
  `harvest_season` varchar(100) NOT NULL,
  `planting_cycle` varchar(100) NOT NULL,
  `variety` varchar(100) NOT NULL,
  `shelf_life` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `fixed_pineapple_supplier`
--

INSERT INTO `fixed_pineapple_supplier` (`id`, `name`, `contact_info`, `farm_location`, `delivery_info`, `communication_mode`, `notes`, `harvest_season`, `planting_cycle`, `variety`, `shelf_life`, `created_at`, `updated_at`) VALUES
(1, 'Calauan Pineapple', '+63 9949407497', 'Molino, Bacoor, Cavite, Region IV-A', 'Business Driver', 'Call', 'Our primary pineapple supplier with premium quality fruits', 'Year-round with peak in summer', '15-20 months', 'MD-2 Sweet Gold', '5-7 days at room temperature, 10-14 days refrigerated', '2025-05-15 12:42:40', '2025-05-27 00:23:43');

-- --------------------------------------------------------

--
-- Table structure for table `inventory_log`
--

CREATE TABLE `inventory_log` (
  `log_id` int(11) NOT NULL,
  `product_id` varchar(10) NOT NULL,
  `change_type` enum('order_completion','manual_adjustment','return','restock') NOT NULL,
  `quantity` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `previous_stock` int(11) NOT NULL,
  `new_stock` int(11) NOT NULL,
  `notes` text DEFAULT NULL,
  `batch_details` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inventory_log`
--

INSERT INTO `inventory_log` (`log_id`, `product_id`, `change_type`, `quantity`, `order_id`, `previous_stock`, `new_stock`, `notes`, `batch_details`, `created_at`, `created_by`) VALUES
(1, 'P031', 'order_completion', 1, 329, 19, 18, NULL, NULL, '2025-04-30 09:22:33', NULL),
(2, 'P036', 'order_completion', 1, 332, 155, 154, NULL, NULL, '2025-04-30 11:10:13', NULL),
(4, 'P036', 'order_completion', 1, 314, 154, 153, 'FIFO batch deduction', '[{\"batch_id\":257,\"batch_code\":\"20250329-067\",\"deducted\":1,\"remaining\":44,\"expiration_date\":\"2025-05-29\"}]', '2025-04-30 12:03:11', NULL),
(5, 'P033', 'order_completion', 1, 312, 30, 29, 'FIFO batch deduction', '[{\"batch_id\":255,\"batch_code\":\"20250329-619\",\"deducted\":1,\"remaining\":4,\"expiration_date\":\"2025-05-28\"}]', '2025-04-30 13:24:10', NULL),
(6, 'P036', 'order_completion', 2, 334, 153, 151, 'FIFO batch deduction', '[{\"batch_id\":257,\"batch_code\":\"20250329-067\",\"deducted\":2,\"remaining\":42,\"expiration_date\":\"2025-05-29\"}]', '2025-04-30 13:27:20', NULL),
(7, 'P033', 'order_completion', 3, 334, 29, 26, 'FIFO batch deduction', '[{\"batch_id\":255,\"batch_code\":\"20250329-619\",\"deducted\":3,\"remaining\":1,\"expiration_date\":\"2025-05-28\"}]', '2025-04-30 13:27:20', NULL),
(8, 'P031', 'order_completion', 1, 286, 18, 17, NULL, NULL, '2025-05-01 08:47:23', NULL),
(9, 'P034', 'order_completion', 1, 335, 3, 2, NULL, NULL, '2025-05-01 08:49:02', NULL),
(10, 'P035', 'order_completion', 1, 336, 41, 40, NULL, NULL, '2025-05-01 08:50:55', NULL),
(11, 'P035', 'order_completion', 1, 337, 40, 39, NULL, NULL, '2025-05-01 08:52:22', NULL),
(12, 'P033', 'order_completion', 1, 306, 26, 25, NULL, NULL, '2025-05-01 08:55:14', NULL),
(13, 'P036', 'order_completion', 20, 338, 151, 131, NULL, NULL, '2025-05-01 09:29:46', NULL),
(14, 'P036', 'order_completion', 1, 317, 131, 130, 'FIFO batch deduction', '[{\"batch_id\":257,\"batch_code\":\"20250329-067\",\"deducted\":1,\"remaining\":41,\"expiration_date\":\"2025-05-29\"}]', '2025-05-01 09:35:51', NULL),
(15, 'P035', 'order_completion', 1, 339, 39, 38, 'FIFO batch deduction', '[{\"batch_id\":256,\"batch_code\":\"20250329-514\",\"deducted\":1,\"remaining\":28,\"expiration_date\":\"2025-05-29\"}]', '2025-05-02 03:38:45', NULL),
(17, 'P033', 'order_completion', 3, 341, 24, 21, 'FIFO batch deduction', '[{\"batch_id\":258,\"batch_code\":\"20250329-408\",\"deducted\":3,\"remaining\":22,\"expiration_date\":\"2025-05-29\"}]', '2025-05-03 16:59:04', NULL),
(18, 'P034', 'order_completion', 2, 341, 2, 0, 'Regular deduction', NULL, '2025-05-03 16:59:04', NULL),
(20, 'P031', 'order_completion', 1, 318, 18, 17, 'FIFO batch deduction', '[{\"batch_id\":268,\"batch_code\":\"20250331-062\",\"deducted\":1,\"remaining\":19,\"expiration_date\":\"2025-05-31\"}]', '2025-05-06 11:03:32', NULL),
(21, 'P033', 'order_completion', 2, 356, 19, 17, 'FIFO batch deduction', '[{\"batch_id\":258,\"batch_code\":\"20250329-408\",\"deducted\":2,\"remaining\":18,\"expiration_date\":\"2025-05-29\"}]', '2025-05-06 18:37:52', NULL),
(22, 'P033', 'order_completion', 1, 356, 17, 16, 'FIFO batch deduction', '[{\"batch_id\":258,\"batch_code\":\"20250329-408\",\"deducted\":1,\"remaining\":17,\"expiration_date\":\"2025-05-29\"}]', '2025-05-06 18:37:52', NULL),
(23, 'P036', 'order_completion', 5, 357, 124, 119, 'FIFO batch deduction', '[{\"batch_id\":257,\"batch_code\":\"20250329-067\",\"deducted\":5,\"remaining\":30,\"expiration_date\":\"2025-05-29\"}]', '2025-05-06 23:19:40', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `last_check_times`
--

CREATE TABLE `last_check_times` (
  `id` int(11) NOT NULL,
  `check_type` varchar(50) NOT NULL,
  `last_check_time` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `last_check_times`
--

INSERT INTO `last_check_times` (`id`, `check_type`, `last_check_time`) VALUES
(1, 'retailer_orders', '2025-04-24 10:49:37');

-- --------------------------------------------------------

--
-- Table structure for table `material_batches`
--

CREATE TABLE `material_batches` (
  `id` int(11) NOT NULL,
  `material_id` int(11) NOT NULL,
  `batch_number` int(11) NOT NULL,
  `quantity` decimal(10,2) NOT NULL DEFAULT 0.00,
  `cost` decimal(10,2) NOT NULL,
  `date_received` date NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `receipt_file` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `material_batches`
--

INSERT INTO `material_batches` (`id`, `material_id`, `batch_number`, `quantity`, `cost`, `date_received`, `expiry_date`, `receipt_file`, `notes`, `created_at`, `updated_at`) VALUES
(20, 24, 1, 1.00, 40.00, '2025-05-25', NULL, NULL, '', '2025-05-25 14:06:57', NULL),
(23, 26, 1, 20.00, 300.00, '2025-05-25', NULL, NULL, '', '2025-05-25 15:00:41', NULL),
(24, 27, 1, 10.00, 200.00, '2025-05-25', NULL, 'uploads/receipts/1748186658_SQL Server Database Creation and Management (1).pdf', 'epsilon', '2025-05-25 15:24:18', NULL),
(26, 22, 2, 20.00, 400.00, '2025-05-25', NULL, NULL, '', '2025-05-25 15:41:31', NULL),
(29, 26, 2, 15.00, 225.00, '2025-05-27', NULL, NULL, '', '2025-05-26 17:09:37', NULL),
(30, 29, 1, 2.00, 200.00, '2025-05-27', NULL, NULL, '', '2025-05-27 13:25:12', NULL),
(31, 30, 1, 20.00, 100.00, '2025-05-28', '2025-07-09', NULL, '', '2025-05-27 16:48:28', NULL),
(32, 31, 1, 500.00, 5000.00, '2025-04-30', NULL, 'uploads/receipts/1748413328_2022-08-16.png', '', '2025-05-28 06:22:08', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `material_containers`
--

CREATE TABLE `material_containers` (
  `id` int(11) NOT NULL,
  `material_id` int(11) NOT NULL,
  `batch_id` int(11) NOT NULL,
  `container_type` enum('dozen','pack','box','unit') NOT NULL,
  `total_pieces` int(11) NOT NULL,
  `used_pieces` int(11) DEFAULT 0,
  `remaining_pieces` int(11) NOT NULL,
  `status` enum('unopened','opened','empty') DEFAULT 'unopened',
  `opened_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `material_usage_log`
--

CREATE TABLE `material_usage_log` (
  `id` int(11) NOT NULL,
  `material_id` int(11) NOT NULL,
  `containers_opened` int(11) DEFAULT 0,
  `pieces_used` decimal(10,3) NOT NULL,
  `pieces_remaining` decimal(10,3) DEFAULT 0.000,
  `usage_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `production_batch_id` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `measurement_conversions`
--

CREATE TABLE `measurement_conversions` (
  `id` int(11) NOT NULL,
  `from_unit` varchar(50) NOT NULL,
  `to_unit` varchar(50) NOT NULL,
  `conversion_factor` decimal(10,6) NOT NULL,
  `category` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `notification_id` varchar(50) NOT NULL,
  `related_id` varchar(50) NOT NULL,
  `type` varchar(50) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `read_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `order_id` varchar(20) NOT NULL,
  `customer_name` varchar(100) NOT NULL,
  `customer_email` varchar(100) DEFAULT NULL,
  `customer_phone` varchar(20) DEFAULT NULL,
  `shipping_address` text DEFAULT NULL,
  `order_date` date NOT NULL,
  `status` enum('pending','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  `payment_method` varchar(50) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `tax` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_batch_usage`
--

CREATE TABLE `order_batch_usage` (
  `id` int(11) NOT NULL,
  `order_id` varchar(50) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `batch_id` int(11) NOT NULL,
  `quantity_used` int(11) NOT NULL,
  `batch_code` varchar(50) NOT NULL,
  `manufacturing_date` date DEFAULT NULL,
  `expiration_date` date DEFAULT NULL,
  `unit_cost` decimal(10,2) DEFAULT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `item_id` int(11) NOT NULL,
  `order_id` varchar(20) NOT NULL,
  `product_id` varchar(20) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_status_history`
--

CREATE TABLE `order_status_history` (
  `id` int(11) NOT NULL,
  `order_id` varchar(20) NOT NULL,
  `status` enum('pending','processing','shipped','delivered','cancelled') NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `payment_id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `payment_method` varchar(20) DEFAULT NULL,
  `reference_number` varchar(50) DEFAULT NULL,
  `payment_platform` varchar(50) DEFAULT NULL,
  `payment_date` datetime DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_history`
--

CREATE TABLE `payment_history` (
  `history_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `payment_id` int(11) DEFAULT NULL,
  `previous_status` enum('pending','partial','completed') NOT NULL,
  `new_status` enum('pending','partial','completed') NOT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pos_payment_methods`
--

CREATE TABLE `pos_payment_methods` (
  `payment_method_id` int(11) NOT NULL,
  `method_name` varchar(50) NOT NULL,
  `method_description` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `requires_reference` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pos_payment_methods`
--

INSERT INTO `pos_payment_methods` (`payment_method_id`, `method_name`, `method_description`, `is_active`, `requires_reference`, `created_at`, `updated_at`) VALUES
(1, 'Cash', 'Cash payment', 1, 0, '2025-03-19 12:59:28', '2025-03-19 12:59:28'),
(2, 'Credit Card', 'Credit card payment', 1, 1, '2025-03-19 12:59:28', '2025-03-19 12:59:28'),
(3, 'Debit Card', 'Debit card payment', 1, 1, '2025-03-19 12:59:28', '2025-03-19 12:59:28'),
(4, 'Mobile Payment', 'GCash, Maya, etc.', 1, 1, '2025-03-19 12:59:28', '2025-03-19 12:59:28'),
(5, 'Bank Transfer', 'Direct bank transfer', 1, 1, '2025-03-19 12:59:28', '2025-03-19 12:59:28');

-- --------------------------------------------------------

--
-- Table structure for table `pos_shifts`
--

CREATE TABLE `pos_shifts` (
  `shift_id` int(11) NOT NULL,
  `cashier_id` varchar(20) NOT NULL,
  `cashier_name` varchar(100) NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `starting_cash` decimal(10,2) NOT NULL DEFAULT 0.00,
  `ending_cash` decimal(10,2) DEFAULT NULL,
  `total_sales` decimal(10,2) DEFAULT NULL,
  `total_refunds` decimal(10,2) DEFAULT NULL,
  `cash_sales` decimal(10,2) DEFAULT NULL,
  `card_sales` decimal(10,2) DEFAULT NULL,
  `other_sales` decimal(10,2) DEFAULT NULL,
  `expected_cash` decimal(10,2) DEFAULT NULL,
  `cash_difference` decimal(10,2) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pos_transactions`
--

CREATE TABLE `pos_transactions` (
  `transaction_id` varchar(20) NOT NULL,
  `transaction_date` datetime NOT NULL DEFAULT current_timestamp(),
  `customer_id` varchar(20) DEFAULT NULL,
  `customer_name` varchar(100) DEFAULT 'Guest',
  `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `tax_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` varchar(20) NOT NULL DEFAULT 'completed',
  `notes` text DEFAULT NULL,
  `cashier_id` varchar(20) NOT NULL,
  `cashier_name` varchar(100) NOT NULL,
  `store_id` varchar(20) NOT NULL DEFAULT '001',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pos_transactions`
--

INSERT INTO `pos_transactions` (`transaction_id`, `transaction_date`, `customer_id`, `customer_name`, `subtotal`, `tax_amount`, `discount_amount`, `total_amount`, `status`, `notes`, `cashier_id`, `cashier_name`, `store_id`, `created_at`, `updated_at`) VALUES
('PG-10247', '2025-04-25 17:21:52', NULL, 'Guest', 20.00, 2.00, 0.00, 22.00, 'completed', NULL, '001', 'Admin User', '001', '2025-04-25 09:21:52', '2025-04-25 09:21:52'),
('PG-10859', '2025-03-22 12:46:11', NULL, 'Guest', 60.00, 6.00, 0.00, 66.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-22 04:46:11', '2025-03-22 04:46:11'),
('PG-12322', '2025-05-03 14:09:55', NULL, 'Guest', 540.00, 0.00, 0.00, 540.00, 'completed', NULL, '001', 'Admin User', '001', '2025-05-03 06:09:55', '2025-05-03 06:09:55'),
('PG-12855', '2025-03-28 15:32:44', NULL, 'Guest', 130.00, 13.00, 3.00, 140.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-28 07:32:44', '2025-03-28 07:32:44'),
('PG-13444', '2025-03-24 11:00:02', NULL, 'Eros', 130.00, 13.00, 0.00, 143.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-24 03:00:02', '2025-03-24 03:00:02'),
('PG-14075', '2025-03-22 14:06:40', NULL, 'Guest', 20.00, 2.00, 0.00, 22.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-22 06:06:40', '2025-03-22 06:06:40'),
('PG-14135', '2025-03-21 22:55:00', NULL, 'Guest', 130.00, 13.00, 0.00, 143.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-21 14:55:00', '2025-03-21 14:55:00'),
('PG-17322', '2025-03-24 11:28:35', NULL, 'Eros', 130.00, 13.00, 0.00, 143.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-24 03:28:35', '2025-03-24 03:28:35'),
('PG-19755', '2025-03-28 18:54:16', NULL, 'Guest', 390.00, 39.00, 0.00, 429.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-28 10:54:16', '2025-03-28 10:54:16'),
('PG-20005', '2025-03-28 19:29:36', NULL, 'Guest', 180.00, 18.00, 0.00, 198.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-28 11:29:36', '2025-03-28 11:29:36'),
('PG-20821', '2025-03-26 22:31:34', NULL, 'Guest', 130.00, 13.00, 0.00, 143.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-26 14:31:34', '2025-03-26 14:31:34'),
('PG-20837', '2025-05-03 14:14:33', NULL, 'Guest', 130.00, 0.00, 0.00, 130.00, 'completed', NULL, '001', 'Admin User', '001', '2025-05-03 06:14:33', '2025-05-03 06:14:33'),
('PG-21510', '2025-03-24 22:34:39', NULL, 'Guest', 130.00, 13.00, 0.00, 143.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-24 14:34:39', '2025-03-24 14:34:39'),
('PG-27687', '2025-05-07 08:09:59', NULL, 'Guest', 130.00, 0.00, 0.00, 130.00, 'completed', NULL, '001', 'Admin User', '001', '2025-05-07 00:09:59', '2025-05-07 00:09:59'),
('PG-32106', '2025-03-22 01:46:58', NULL, 'Guest', 50.00, 5.00, 5.00, 50.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-21 17:46:58', '2025-03-21 17:46:58'),
('PG-32147', '2025-05-03 14:26:24', NULL, 'Guest', 130.00, 0.00, 0.00, 130.00, 'completed', NULL, '001', 'Admin User', '001', '2025-05-03 06:26:24', '2025-05-03 06:26:24'),
('PG-39224', '2025-03-30 16:32:48', NULL, 'Guest', 130.00, 13.00, 0.00, 143.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-30 08:32:48', '2025-03-30 08:32:48'),
('PG-42165', '2025-03-22 23:32:26', NULL, 'Guest', 15.00, 1.50, 0.00, 16.50, 'completed', NULL, '001', 'Admin User', '001', '2025-03-22 15:32:26', '2025-03-22 15:32:26'),
('PG-43489', '2025-03-28 17:59:10', NULL, 'Guest', 540.00, 54.00, 0.00, 594.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-28 09:59:10', '2025-03-28 09:59:10'),
('PG-43566', '2025-03-19 23:47:36', NULL, 'Guest', 50.00, 5.00, 0.00, 55.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-19 15:47:36', '2025-03-19 15:47:36'),
('PG-46943', '2025-03-28 19:15:30', NULL, 'Guest', 540.00, 54.00, 0.00, 594.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-28 11:15:30', '2025-03-28 11:15:30'),
('PG-47964', '2025-05-03 14:03:24', NULL, 'Guest', 130.00, 13.00, 0.00, 143.00, 'completed', NULL, '001', 'Admin User', '001', '2025-05-03 06:03:24', '2025-05-03 06:03:24'),
('PG-49474', '2025-03-24 11:25:07', NULL, 'Guest', 130.00, 13.00, 0.00, 143.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-24 03:25:07', '2025-03-24 03:25:07'),
('PG-50239', '2025-05-03 14:25:26', NULL, 'Guest', 130.00, 0.00, 0.00, 130.00, 'completed', NULL, '001', 'Admin User', '001', '2025-05-03 06:25:26', '2025-05-03 06:25:26'),
('PG-51186', '2025-03-29 17:31:47', NULL, 'Guest', 130.00, 13.00, 0.00, 143.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-29 09:31:47', '2025-03-29 09:31:47'),
('PG-52573', '2025-03-29 13:16:19', NULL, 'Aer', 260.00, 26.00, 0.00, 286.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-29 05:16:19', '2025-03-29 05:16:19'),
('PG-52685', '2025-05-03 14:02:20', NULL, 'Guest', 130.00, 0.00, 0.00, 130.00, 'completed', NULL, '001', 'Admin User', '001', '2025-05-03 06:02:20', '2025-05-03 06:02:20'),
('PG-53159', '2025-03-31 08:54:06', NULL, 'Guest', 3780.00, 378.00, 0.00, 4158.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-31 00:54:06', '2025-03-31 00:54:06'),
('PG-55270', '2025-05-02 19:51:12', NULL, 'Guest', 130.00, 13.00, 0.00, 143.00, 'completed', NULL, '001', 'Admin User', '001', '2025-05-02 11:51:12', '2025-05-02 11:51:12'),
('PG-56303', '2025-03-22 21:25:52', NULL, 'Guest', 20.00, 2.00, 0.00, 22.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-22 13:25:52', '2025-03-22 13:25:52'),
('PG-61343', '2025-03-23 21:41:37', NULL, 'Guest', 20.00, 2.00, 0.00, 22.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-23 13:41:37', '2025-03-23 13:41:37'),
('PG-62255', '2025-03-26 18:09:54', NULL, 'Guest', 1500.00, 150.00, 0.00, 1650.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-26 10:09:54', '2025-03-26 10:09:54'),
('PG-66254', '2025-03-19 21:00:53', NULL, 'Guest', 50.00, 5.00, 0.00, 55.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-19 13:00:53', '2025-03-19 13:00:53'),
('PG-67110', '2025-05-03 14:33:51', NULL, 'Guest', 130.00, 0.00, 0.00, 130.00, 'completed', NULL, '001', 'Admin User', '001', '2025-05-03 06:33:51', '2025-05-03 06:33:51'),
('PG-71150', '2025-03-22 22:56:57', NULL, 'Guest', 20.00, 2.00, 0.00, 22.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-22 14:56:57', '2025-03-22 14:56:57'),
('PG-71397', '2025-03-31 08:43:25', NULL, 'Guest', 2730.00, 273.00, 20.00, 2983.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-31 00:43:25', '2025-03-31 00:43:25'),
('PG-72587', '2025-03-22 19:32:45', NULL, 'Guest', 10.00, 1.00, 0.00, 11.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-22 11:32:45', '2025-03-22 11:32:45'),
('PG-74398', '2025-03-28 18:51:57', NULL, 'Benchi', 130.00, 13.00, 0.00, 143.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-28 10:51:57', '2025-03-28 10:51:57'),
('PG-75192', '2025-05-03 14:27:35', NULL, 'Guest', 130.00, 0.00, 0.00, 130.00, 'completed', NULL, '001', 'Admin User', '001', '2025-05-03 06:27:35', '2025-05-03 06:27:35'),
('PG-75200', '2025-05-03 14:06:28', NULL, 'Guest', 130.00, 0.00, 0.00, 130.00, 'completed', NULL, '001', 'Admin User', '001', '2025-05-03 06:06:28', '2025-05-03 06:06:28'),
('PG-76607', '2025-03-22 13:11:05', NULL, 'Guest', 60.00, 6.00, 0.00, 66.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-22 05:11:05', '2025-03-22 05:11:05'),
('PG-78975', '2025-05-03 14:20:10', NULL, 'Guest', 50.00, 0.00, 0.00, 50.00, 'completed', NULL, '001', 'Admin User', '001', '2025-05-03 06:20:10', '2025-05-03 06:20:10'),
('PG-80317', '2025-05-03 14:13:05', NULL, 'Guest', 50.00, 0.00, 0.00, 50.00, 'completed', NULL, '001', 'Admin User', '001', '2025-05-03 06:13:05', '2025-05-03 06:13:05'),
('PG-80501', '2025-05-03 14:28:38', NULL, 'Guest', 130.00, 0.00, 0.00, 130.00, 'completed', NULL, '001', 'Admin User', '001', '2025-05-03 06:28:38', '2025-05-03 06:28:38'),
('PG-81305', '2025-03-24 11:25:38', NULL, 'Guest', 180.00, 18.00, 0.00, 198.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-24 03:25:38', '2025-03-24 03:25:38'),
('PG-82259', '2025-04-21 07:04:19', NULL, 'Guest', 130.00, 13.00, 0.00, 143.00, 'completed', NULL, '001', 'Admin User', '001', '2025-04-20 23:04:19', '2025-04-20 23:04:19'),
('PG-88171', '2025-05-03 14:18:30', NULL, 'Guest', 130.00, 0.00, 0.00, 130.00, 'completed', NULL, '001', 'Admin User', '001', '2025-05-03 06:18:30', '2025-05-03 06:18:30'),
('PG-91308', '2025-03-24 23:27:26', NULL, 'Guest', 60.00, 6.00, 6.00, 60.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-24 15:27:26', '2025-03-24 15:27:26'),
('PG-91640', '2025-03-20 13:01:49', NULL, 'Guest', 300.00, 30.00, 0.00, 330.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-20 05:01:49', '2025-03-20 05:01:49'),
('PG-93296', '2025-05-03 13:17:05', NULL, 'Guest', 330.00, 33.00, 0.00, 363.00, 'completed', NULL, '001', 'Admin User', '001', '2025-05-03 05:17:05', '2025-05-03 05:17:05'),
('PG-93675', '2025-04-12 15:18:49', NULL, 'Guest', 110.00, 11.00, 0.00, 121.00, 'completed', NULL, '001', 'Admin User', '001', '2025-04-12 07:18:49', '2025-04-12 07:18:49'),
('PG-94258', '2025-03-31 07:51:31', NULL, 'Guest', 130.00, 13.00, 0.00, 143.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-30 23:51:31', '2025-03-30 23:51:31'),
('PG-97698', '2025-03-23 17:34:25', NULL, 'Guest', 20.00, 2.00, 0.00, 22.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-23 09:34:25', '2025-03-23 09:34:25'),
('PG-98418', '2025-03-30 22:15:24', NULL, 'Guest', 60.00, 6.00, 0.00, 66.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-30 14:15:24', '2025-03-30 14:15:24'),
('PG-98880', '2025-03-28 13:55:50', NULL, 'Van', 130.00, 13.00, 0.00, 143.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-28 05:55:50', '2025-03-28 05:55:50'),
('PG-99521', '2025-03-28 17:07:52', NULL, 'Guest', 130.00, 13.00, 0.00, 143.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-28 09:07:52', '2025-03-28 09:07:52'),
('PG-99709', '2025-03-30 22:14:32', NULL, 'Guest', 60.00, 6.00, 0.00, 66.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-30 14:14:32', '2025-03-30 14:14:32');

-- --------------------------------------------------------

--
-- Table structure for table `pos_transaction_items`
--

CREATE TABLE `pos_transaction_items` (
  `item_id` int(11) NOT NULL,
  `transaction_id` varchar(20) NOT NULL,
  `product_id` varchar(20) NOT NULL,
  `product_name` varchar(100) NOT NULL,
  `quantity` decimal(10,3) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `discount_percent` decimal(5,2) NOT NULL DEFAULT 0.00,
  `discount_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `tax_percent` decimal(5,2) NOT NULL DEFAULT 0.00,
  `tax_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `subtotal` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pos_transaction_items`
--

INSERT INTO `pos_transaction_items` (`item_id`, `transaction_id`, `product_id`, `product_name`, `quantity`, `unit_price`, `discount_percent`, `discount_amount`, `tax_percent`, `tax_amount`, `subtotal`, `total_price`, `created_at`) VALUES
(1, 'PG-66254', 'P002', 'Piña Putoseko', 1.000, 50.00, 0.00, 0.00, 10.00, 5.00, 50.00, 55.00, '2025-03-19 13:00:53'),
(2, 'PG-43566', 'P002', 'Piña Putoseko', 1.000, 50.00, 0.00, 0.00, 10.00, 5.00, 50.00, 55.00, '2025-03-19 15:47:36'),
(5, 'PG-32106', 'P002', 'Piña Putoseko', 1.000, 50.00, 0.00, 0.00, 10.00, 5.00, 50.00, 55.00, '2025-03-21 17:46:58'),
(15, 'PG-13444', 'P016', 'Piña Mangga Bars', 1.000, 130.00, 0.00, 0.00, 10.00, 13.00, 130.00, 143.00, '2025-03-24 03:00:02'),
(16, 'PG-49474', 'P016', 'Piña Mangga Bars', 1.000, 130.00, 0.00, 0.00, 10.00, 13.00, 130.00, 143.00, '2025-03-24 03:25:07'),
(17, 'PG-81305', 'P012', 'PiñaTuyo', 1.000, 180.00, 0.00, 0.00, 10.00, 18.00, 180.00, 198.00, '2025-03-24 03:25:38'),
(18, 'PG-17322', 'P016', 'Piña Mangga Bars', 1.000, 130.00, 0.00, 0.00, 10.00, 13.00, 130.00, 143.00, '2025-03-24 03:28:35'),
(19, 'PG-21510', 'P017', 'Piña Tsokolate', 1.000, 130.00, 0.00, 0.00, 10.00, 13.00, 130.00, 143.00, '2025-03-24 14:34:39'),
(20, 'PG-91308', 'P015', 'Piña Dishwashing Soap', 1.000, 60.00, 0.00, 0.00, 10.00, 6.00, 60.00, 66.00, '2025-03-24 15:27:26'),
(22, 'PG-20821', 'P030', 'PiñaTuyo', 1.000, 130.00, 0.00, 0.00, 10.00, 13.00, 130.00, 143.00, '2025-03-26 14:31:34'),
(23, 'PG-98880', 'P032', 'Pina Tsokolate Bars', 1.000, 130.00, 0.00, 0.00, 10.00, 13.00, 130.00, 143.00, '2025-03-28 05:55:50'),
(24, 'PG-12855', 'P032', 'Pina Tsokolate Bars', 1.000, 130.00, 0.00, 0.00, 10.00, 13.00, 130.00, 143.00, '2025-03-28 07:32:44'),
(25, 'PG-99521', 'P032', 'Pina Tsokolate Bars', 1.000, 130.00, 0.00, 0.00, 10.00, 13.00, 130.00, 143.00, '2025-03-28 09:07:52'),
(32, 'PG-74398', 'P030', 'PiñaTuyo', 1.000, 130.00, 0.00, 0.00, 10.00, 13.00, 130.00, 143.00, '2025-03-28 10:51:57'),
(33, 'PG-19755', 'P030', 'PiñaTuyo', 3.000, 130.00, 0.00, 0.00, 10.00, 39.00, 390.00, 429.00, '2025-03-28 10:54:16'),
(45, 'PG-52573', 'P029', 'Piña Bars', 2.000, 130.00, 0.00, 0.00, 10.00, 26.00, 260.00, 286.00, '2025-03-29 05:16:19'),
(46, 'PG-51186', 'P029', 'Piña Bars', 1.000, 130.00, 0.00, 0.00, 10.00, 13.00, 130.00, 143.00, '2025-03-29 09:31:47'),
(47, 'PG-39224', 'P029', 'Piña Bars', 1.000, 130.00, 0.00, 0.00, 10.00, 13.00, 130.00, 143.00, '2025-03-30 08:32:48'),
(48, 'PG-99709', 'P034', 'Piña Dishwashing Soap', 1.000, 60.00, 0.00, 0.00, 10.00, 6.00, 60.00, 66.00, '2025-03-30 14:14:32'),
(49, 'PG-98418', 'P034', 'Piña Dishwashing Soap', 1.000, 60.00, 0.00, 0.00, 10.00, 6.00, 60.00, 66.00, '2025-03-30 14:15:24'),
(50, 'PG-94258', 'P035', 'Piña Mangga Bars', 1.000, 130.00, 0.00, 0.00, 10.00, 13.00, 130.00, 143.00, '2025-03-30 23:51:31'),
(51, 'PG-71397', 'P029', 'Piña Bars', 21.000, 130.00, 0.00, 0.00, 10.00, 273.00, 2730.00, 3003.00, '2025-03-31 00:43:25'),
(52, 'PG-53159', 'P031', 'Piña Tuyo', 21.000, 180.00, 0.00, 0.00, 10.00, 378.00, 3780.00, 4158.00, '2025-03-31 00:54:06'),
(53, 'PG-93675', 'P030', 'Piña Putoseko', 1.000, 50.00, 0.00, 0.00, 10.00, 5.00, 50.00, 55.00, '2025-04-12 07:18:49'),
(54, 'PG-93675', 'P034', 'Piña Dishwashing Soap', 1.000, 60.00, 0.00, 0.00, 10.00, 6.00, 60.00, 66.00, '2025-04-12 07:18:49'),
(55, 'PG-82259', 'P029', 'Piña Bars', 1.000, 130.00, 0.00, 0.00, 10.00, 13.00, 130.00, 143.00, '2025-04-20 23:04:19'),
(56, 'PG-10247', 'P039', 'Sponge', 1.000, 20.00, 0.00, 0.00, 10.00, 2.00, 20.00, 22.00, '2025-04-25 09:21:52'),
(57, 'PG-55270', 'P035', 'Piña Mangga Bars', 1.000, 130.00, 0.00, 0.00, 10.00, 13.00, 130.00, 143.00, '2025-05-02 11:51:12'),
(58, 'PG-93296', 'P037', 'Peanut Butter', 1.000, 200.00, 0.00, 0.00, 10.00, 20.00, 200.00, 220.00, '2025-05-03 05:17:05'),
(59, 'PG-93296', 'P029', 'Piña Bars', 1.000, 130.00, 0.00, 0.00, 10.00, 13.00, 130.00, 143.00, '2025-05-03 05:17:05'),
(60, 'PG-52685', 'P035', 'Piña Mangga Bars', 1.000, 130.00, 0.00, 0.00, 10.00, 13.00, 130.00, 143.00, '2025-05-03 06:02:20'),
(61, 'PG-47964', 'P029', 'Piña Bars', 1.000, 130.00, 0.00, 0.00, 10.00, 13.00, 130.00, 143.00, '2025-05-03 06:03:24'),
(62, 'PG-75200', 'P035', 'Piña Mangga Bars', 1.000, 130.00, 0.00, 0.00, 10.00, 13.00, 130.00, 143.00, '2025-05-03 06:06:28'),
(63, 'PG-12322', 'P032', 'TinaPiña', 3.000, 180.00, 0.00, 0.00, 10.00, 54.00, 540.00, 594.00, '2025-05-03 06:09:55'),
(64, 'PG-80317', 'P030', 'Piña Putoseko', 1.000, 50.00, 0.00, 0.00, 10.00, 5.00, 50.00, 55.00, '2025-05-03 06:13:05'),
(65, 'PG-20837', 'P036', 'Piña Tsokolate Bars', 1.000, 130.00, 0.00, 0.00, 10.00, 13.00, 130.00, 143.00, '2025-05-03 06:14:33'),
(66, 'PG-88171', 'P033', 'Pineapple Concentrate', 1.000, 130.00, 0.00, 0.00, 10.00, 13.00, 130.00, 143.00, '2025-05-03 06:18:30'),
(67, 'PG-78975', 'P030', 'Piña Putoseko', 1.000, 50.00, 0.00, 0.00, 10.00, 5.00, 50.00, 55.00, '2025-05-03 06:20:10'),
(68, 'PG-50239', 'P036', 'Piña Tsokolate Bars', 1.000, 130.00, 0.00, 0.00, 0.00, 13.00, 130.00, 143.00, '2025-05-03 06:25:26'),
(69, 'PG-32147', 'P036', 'Piña Tsokolate Bars', 1.000, 130.00, 0.00, 0.00, 0.00, 13.00, 130.00, 143.00, '2025-05-03 06:26:24'),
(70, 'PG-75192', 'P036', 'Piña Tsokolate Bars', 1.000, 130.00, 0.00, 0.00, 20.00, 13.00, 130.00, 143.00, '2025-05-03 06:27:35'),
(71, 'PG-80501', 'P036', 'Piña Tsokolate Bars', 1.000, 130.00, 0.00, 0.00, 0.00, 0.00, 130.00, 130.00, '2025-05-03 06:28:38'),
(72, 'PG-67110', 'P036', 'Piña Tsokolate Bars', 1.000, 130.00, 0.00, 0.00, 0.00, 0.00, 130.00, 130.00, '2025-05-03 06:33:51'),
(73, 'PG-27687', 'P036', 'Piña Tsokolate Bars', 1.000, 130.00, 0.00, 0.00, 0.00, 0.00, 130.00, 130.00, '2025-05-07 00:09:59');

-- --------------------------------------------------------

--
-- Table structure for table `pos_transaction_payments`
--

CREATE TABLE `pos_transaction_payments` (
  `payment_id` int(11) NOT NULL,
  `transaction_id` varchar(20) NOT NULL,
  `payment_method_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `payment_date` datetime NOT NULL DEFAULT current_timestamp(),
  `payment_status` varchar(20) NOT NULL DEFAULT 'completed',
  `change_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pos_transaction_payments`
--

INSERT INTO `pos_transaction_payments` (`payment_id`, `transaction_id`, `payment_method_id`, `amount`, `reference_number`, `payment_date`, `payment_status`, `change_amount`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'PG-66254', 1, 55.00, NULL, '2025-03-19 21:00:53', 'completed', 0.00, NULL, '2025-03-19 13:00:53', '2025-03-19 13:00:53'),
(2, 'PG-43566', 1, 55.00, NULL, '2025-03-19 23:47:36', 'completed', 0.00, NULL, '2025-03-19 15:47:36', '2025-03-19 15:47:36'),
(3, 'PG-91640', 1, 330.00, NULL, '2025-03-20 13:01:49', 'completed', 0.00, NULL, '2025-03-20 05:01:49', '2025-03-20 05:01:49'),
(4, 'PG-14135', 1, 143.00, NULL, '2025-03-21 22:55:00', 'completed', 0.00, NULL, '2025-03-21 14:55:00', '2025-03-21 14:55:00'),
(5, 'PG-32106', 1, 50.00, NULL, '2025-03-22 01:46:58', 'completed', 50.00, NULL, '2025-03-21 17:46:58', '2025-03-21 17:46:58'),
(6, 'PG-10859', 1, 66.00, NULL, '2025-03-22 12:46:11', 'completed', 0.00, NULL, '2025-03-22 04:46:11', '2025-03-22 04:46:11'),
(7, 'PG-76607', 1, 66.00, NULL, '2025-03-22 13:11:05', 'completed', 0.00, NULL, '2025-03-22 05:11:05', '2025-03-22 05:11:05'),
(8, 'PG-14075', 1, 22.00, NULL, '2025-03-22 14:06:40', 'completed', 0.00, NULL, '2025-03-22 06:06:40', '2025-03-22 06:06:40'),
(9, 'PG-72587', 1, 11.00, NULL, '2025-03-22 19:32:45', 'completed', 0.00, NULL, '2025-03-22 11:32:45', '2025-03-22 11:32:45'),
(10, 'PG-56303', 1, 22.00, NULL, '2025-03-22 21:25:52', 'completed', 0.00, NULL, '2025-03-22 13:25:52', '2025-03-22 13:25:52'),
(11, 'PG-71150', 1, 22.00, NULL, '2025-03-22 22:56:57', 'completed', 0.00, NULL, '2025-03-22 14:56:57', '2025-03-22 14:56:57'),
(12, 'PG-42165', 1, 16.50, NULL, '2025-03-22 23:32:26', 'completed', 0.00, NULL, '2025-03-22 15:32:26', '2025-03-22 15:32:26'),
(13, 'PG-97698', 1, 22.00, NULL, '2025-03-23 17:34:25', 'completed', 0.00, NULL, '2025-03-23 09:34:25', '2025-03-23 09:34:25'),
(14, 'PG-61343', 1, 22.00, NULL, '2025-03-23 21:41:37', 'completed', 0.00, NULL, '2025-03-23 13:41:37', '2025-03-23 13:41:37'),
(15, 'PG-13444', 1, 143.00, NULL, '2025-03-24 11:00:02', 'completed', 57.00, NULL, '2025-03-24 03:00:02', '2025-03-24 03:00:02'),
(16, 'PG-49474', 1, 143.00, NULL, '2025-03-24 11:25:07', 'completed', 0.00, NULL, '2025-03-24 03:25:07', '2025-03-24 03:25:07'),
(17, 'PG-81305', 1, 198.00, NULL, '2025-03-24 11:25:38', 'completed', 0.00, NULL, '2025-03-24 03:25:38', '2025-03-24 03:25:38'),
(18, 'PG-17322', 1, 143.00, NULL, '2025-03-24 11:28:35', 'completed', 0.00, NULL, '2025-03-24 03:28:35', '2025-03-24 03:28:35'),
(19, 'PG-21510', 1, 143.00, NULL, '2025-03-24 22:34:39', 'completed', 357.00, NULL, '2025-03-24 14:34:39', '2025-03-24 14:34:39'),
(20, 'PG-91308', 1, 60.00, NULL, '2025-03-24 23:27:26', 'completed', 40.00, NULL, '2025-03-24 15:27:26', '2025-03-24 15:27:26'),
(21, 'PG-62255', 1, 1650.00, NULL, '2025-03-26 18:09:54', 'completed', 350.00, NULL, '2025-03-26 10:09:54', '2025-03-26 10:09:54'),
(22, 'PG-20821', 1, 143.00, NULL, '2025-03-26 22:31:34', 'completed', 357.00, NULL, '2025-03-26 14:31:34', '2025-03-26 14:31:34'),
(23, 'PG-98880', 1, 143.00, NULL, '2025-03-28 13:55:50', 'completed', 357.00, NULL, '2025-03-28 05:55:50', '2025-03-28 05:55:50'),
(24, 'PG-12855', 1, 140.00, NULL, '2025-03-28 15:32:44', 'completed', 0.00, NULL, '2025-03-28 07:32:44', '2025-03-28 07:32:44'),
(25, 'PG-99521', 1, 143.00, NULL, '2025-03-28 17:07:52', 'completed', 7.00, NULL, '2025-03-28 09:07:52', '2025-03-28 09:07:52'),
(26, 'PG-43489', 1, 594.00, NULL, '2025-03-28 17:59:11', 'completed', 406.00, NULL, '2025-03-28 09:59:11', '2025-03-28 09:59:11'),
(27, 'PG-74398', 1, 143.00, NULL, '2025-03-28 18:51:57', 'completed', 0.00, NULL, '2025-03-28 10:51:57', '2025-03-28 10:51:57'),
(28, 'PG-19755', 1, 429.00, NULL, '2025-03-28 18:54:16', 'completed', 0.00, NULL, '2025-03-28 10:54:16', '2025-03-28 10:54:16'),
(29, 'PG-46943', 1, 594.00, NULL, '2025-03-28 19:15:30', 'completed', 0.00, NULL, '2025-03-28 11:15:30', '2025-03-28 11:15:30'),
(30, 'PG-20005', 1, 198.00, NULL, '2025-03-28 19:29:36', 'completed', 0.00, NULL, '2025-03-28 11:29:36', '2025-03-28 11:29:36'),
(31, 'PG-52573', 1, 286.00, NULL, '2025-03-29 13:16:19', 'completed', 14.00, NULL, '2025-03-29 05:16:19', '2025-03-29 05:16:19'),
(32, 'PG-51186', 1, 143.00, NULL, '2025-03-29 17:31:47', 'completed', 0.00, NULL, '2025-03-29 09:31:47', '2025-03-29 09:31:47'),
(33, 'PG-39224', 1, 143.00, NULL, '2025-03-30 16:32:48', 'completed', 57.00, NULL, '2025-03-30 08:32:48', '2025-03-30 08:32:48'),
(34, 'PG-99709', 1, 66.00, NULL, '2025-03-30 22:14:32', 'completed', 4.00, NULL, '2025-03-30 14:14:32', '2025-03-30 14:14:32'),
(35, 'PG-98418', 1, 66.00, NULL, '2025-03-30 22:15:24', 'completed', 0.00, NULL, '2025-03-30 14:15:24', '2025-03-30 14:15:24'),
(36, 'PG-94258', 1, 143.00, NULL, '2025-03-31 07:51:31', 'completed', 0.00, NULL, '2025-03-30 23:51:31', '2025-03-30 23:51:31'),
(37, 'PG-71397', 1, 2983.00, NULL, '2025-03-31 08:43:25', 'completed', 0.00, NULL, '2025-03-31 00:43:25', '2025-03-31 00:43:25'),
(38, 'PG-53159', 1, 4158.00, NULL, '2025-03-31 08:54:06', 'completed', 0.00, NULL, '2025-03-31 00:54:06', '2025-03-31 00:54:06'),
(39, 'PG-93675', 1, 121.00, NULL, '2025-04-12 15:18:49', 'completed', 0.00, NULL, '2025-04-12 07:18:49', '2025-04-12 07:18:49'),
(40, 'PG-82259', 1, 143.00, NULL, '2025-04-21 07:04:19', 'completed', 0.00, NULL, '2025-04-20 23:04:19', '2025-04-20 23:04:19'),
(41, 'PG-10247', 1, 22.00, NULL, '2025-04-25 17:21:52', 'completed', 0.00, NULL, '2025-04-25 09:21:52', '2025-04-25 09:21:52'),
(42, 'PG-55270', 1, 143.00, NULL, '2025-05-02 19:51:12', 'completed', 0.00, NULL, '2025-05-02 11:51:12', '2025-05-02 11:51:12'),
(43, 'PG-93296', 1, 363.00, NULL, '2025-05-03 13:17:05', 'completed', 0.00, NULL, '2025-05-03 05:17:05', '2025-05-03 05:17:05'),
(44, 'PG-52685', 1, 130.00, NULL, '2025-05-03 14:02:20', 'completed', 0.00, NULL, '2025-05-03 06:02:20', '2025-05-03 06:02:20'),
(45, 'PG-47964', 1, 143.00, NULL, '2025-05-03 14:03:25', 'completed', 0.00, NULL, '2025-05-03 06:03:25', '2025-05-03 06:03:25'),
(46, 'PG-75200', 1, 130.00, NULL, '2025-05-03 14:06:28', 'completed', 0.00, NULL, '2025-05-03 06:06:28', '2025-05-03 06:06:28'),
(47, 'PG-12322', 1, 540.00, NULL, '2025-05-03 14:09:55', 'completed', 0.00, NULL, '2025-05-03 06:09:55', '2025-05-03 06:09:55'),
(48, 'PG-80317', 1, 50.00, NULL, '2025-05-03 14:13:05', 'completed', 0.00, NULL, '2025-05-03 06:13:05', '2025-05-03 06:13:05'),
(49, 'PG-20837', 1, 130.00, NULL, '2025-05-03 14:14:33', 'completed', 0.00, NULL, '2025-05-03 06:14:33', '2025-05-03 06:14:33'),
(50, 'PG-88171', 1, 130.00, NULL, '2025-05-03 14:18:30', 'completed', 0.00, NULL, '2025-05-03 06:18:30', '2025-05-03 06:18:30'),
(51, 'PG-78975', 1, 50.00, NULL, '2025-05-03 14:20:10', 'completed', 0.00, NULL, '2025-05-03 06:20:10', '2025-05-03 06:20:10'),
(52, 'PG-50239', 1, 130.00, NULL, '2025-05-03 14:25:26', 'completed', 0.00, NULL, '2025-05-03 06:25:26', '2025-05-03 06:25:26'),
(53, 'PG-32147', 1, 130.00, NULL, '2025-05-03 14:26:24', 'completed', 0.00, NULL, '2025-05-03 06:26:24', '2025-05-03 06:26:24'),
(54, 'PG-75192', 1, 130.00, NULL, '2025-05-03 14:27:35', 'completed', 0.00, NULL, '2025-05-03 06:27:35', '2025-05-03 06:27:35'),
(55, 'PG-80501', 1, 130.00, NULL, '2025-05-03 14:28:38', 'completed', 0.00, NULL, '2025-05-03 06:28:38', '2025-05-03 06:28:38'),
(56, 'PG-67110', 1, 130.00, NULL, '2025-05-03 14:33:51', 'completed', 0.00, NULL, '2025-05-03 06:33:51', '2025-05-03 06:33:51'),
(57, 'PG-27687', 1, 130.00, NULL, '2025-05-07 08:09:59', 'completed', 0.00, NULL, '2025-05-07 00:09:59', '2025-05-07 00:09:59');

-- --------------------------------------------------------

--
-- Table structure for table `pos_transaction_refunds`
--

CREATE TABLE `pos_transaction_refunds` (
  `refund_id` int(11) NOT NULL,
  `transaction_id` varchar(20) NOT NULL,
  `refund_amount` decimal(10,2) NOT NULL,
  `refund_reason` text NOT NULL,
  `refund_date` datetime NOT NULL DEFAULT current_timestamp(),
  `refunded_by` varchar(20) NOT NULL,
  `refund_method_id` int(11) NOT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'completed',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `productions`
--

CREATE TABLE `productions` (
  `id` int(11) NOT NULL,
  `production_id` varchar(50) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `batch_size` int(11) NOT NULL,
  `priority` enum('low','normal','high','urgent') DEFAULT 'normal',
  `status` enum('pending','in-progress','quality-check','completed','cancelled','on-hold') DEFAULT 'pending',
  `progress` decimal(5,2) DEFAULT 0.00,
  `start_date` date NOT NULL,
  `estimated_completion` datetime DEFAULT NULL,
  `actual_completion` datetime DEFAULT NULL,
  `estimated_duration_hours` int(11) DEFAULT 8,
  `actual_duration_hours` int(11) DEFAULT NULL,
  `production_type` enum('new-product','existing-batch','custom') DEFAULT 'new-product',
  `recipe_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`recipe_data`)),
  `auto_create_product` tinyint(1) DEFAULT 1,
  `target_price` decimal(10,2) DEFAULT NULL,
  `target_expiration_days` int(11) DEFAULT 365,
  `notes` text DEFAULT NULL,
  `quality_status` enum('pending','passed','failed','needs-review') DEFAULT 'pending',
  `quality_notes` text DEFAULT NULL,
  `quality_checked_by` int(11) DEFAULT NULL,
  `quality_checked_at` timestamp NULL DEFAULT NULL,
  `assigned_to` varchar(100) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `productions`
--

INSERT INTO `productions` (`id`, `production_id`, `product_id`, `product_name`, `category`, `batch_size`, `priority`, `status`, `progress`, `start_date`, `estimated_completion`, `actual_completion`, `estimated_duration_hours`, `actual_duration_hours`, `production_type`, `recipe_data`, `auto_create_product`, `target_price`, `target_expiration_days`, `notes`, `quality_status`, `quality_notes`, `quality_checked_by`, `quality_checked_at`, `assigned_to`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'PROD20250526-2873', NULL, 'Putoseko', 'Snacks', 20, 'normal', 'completed', 100.00, '2025-05-26', '2025-05-26 08:00:00', '2025-06-18 01:29:12', 8, NULL, 'new-product', '[{\"material_id\":\"22\",\"material_name\":\"Garapon\",\"quantity\":20,\"unit\":\"Unit\",\"cost\":600},{\"material_id\":\"24\",\"material_name\":\"Plastic\",\"quantity\":1,\"unit\":\"Pack\",\"cost\":40}]', 1, NULL, 365, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, '2025-05-26 10:00:27', '2025-06-17 17:29:12'),
(2, 'PROD20250617-7622', 116, 'Piña Bars', 'Snacks', 4, 'normal', 'completed', 100.00, '2025-06-17', '2025-06-17 08:00:00', '2025-06-18 01:29:09', 8, NULL, 'existing-batch', NULL, 1, NULL, 365, NULL, 'pending', NULL, NULL, NULL, 'Admin User', NULL, '2025-06-17 15:36:36', '2025-06-17 17:29:09'),
(3, 'PROD20250617-3983', 144, 'Sponge', 'Detergent', 5, 'normal', 'completed', 100.00, '2025-06-17', '2025-06-17 08:00:00', '2025-06-18 01:18:52', 8, NULL, 'existing-batch', NULL, 1, NULL, 365, NULL, 'pending', NULL, NULL, NULL, 'Admin User', NULL, '2025-06-17 17:18:41', '2025-06-17 17:18:52'),
(4, 'PROD20250617-6268', 120, 'Pineapple Concentrate', 'Preserves', 5, 'normal', 'completed', 100.00, '2025-06-17', '2025-06-17 08:00:00', '2025-06-18 01:29:02', 8, NULL, 'existing-batch', NULL, 1, NULL, 365, NULL, 'pending', NULL, NULL, NULL, 'Admin User', NULL, '2025-06-17 17:19:36', '2025-06-17 17:29:02'),
(5, 'PROD20250617-1579', 124, 'Piña Tsokolate Bars', 'Snacks', 5, 'urgent', 'completed', 100.00, '2025-06-17', '2025-06-17 08:00:00', '2025-06-18 01:32:48', 8, NULL, 'existing-batch', NULL, 1, NULL, 365, NULL, 'pending', NULL, NULL, NULL, 'Admin User', NULL, '2025-06-17 17:32:29', '2025-06-17 17:32:48'),
(6, 'PROD20250617-0234', NULL, 'Sting', 'Beverages', 10, 'high', 'completed', 0.00, '2025-06-17', '2025-06-17 08:00:00', NULL, 8, NULL, 'new-product', '[{\"material_id\":\"22\",\"material_name\":\"Garapon\",\"quantity\":10,\"unit\":\"pieces\",\"unit_cost\":0,\"total_cost\":0},{\"material_id\":\"27\",\"material_name\":\"Honey\",\"quantity\":5,\"unit\":\"pieces\",\"unit_cost\":0,\"total_cost\":0}]', 1, NULL, 365, NULL, 'pending', NULL, NULL, NULL, 'Admin User', NULL, '2025-06-17 19:49:10', '2025-06-19 18:58:16'),
(7, 'PROD20250617-2704', 116, 'Piña Bars', 'Snacks', 10, 'normal', 'completed', 100.00, '2025-06-17', '2025-06-17 08:00:00', '2025-06-19 18:03:43', 8, NULL, 'existing-batch', NULL, 1, NULL, 365, '\nQuality Check: 100% quality score, 10/10 passed QC. Checked by: Quality Inspector. Notes: ', '', NULL, NULL, NULL, 'Admin User', NULL, '2025-06-17 19:51:17', '2025-06-19 10:03:43'),
(14, 'PROD20250619-2829', NULL, 'Test', 'Beverages', 5, 'urgent', 'quality-check', 80.00, '2025-06-19', '2025-06-19 08:00:00', NULL, 8, NULL, 'new-product', '[{\"material_id\":\"22\",\"material_name\":\"Garapon\",\"quantity\":10,\"unit\":\"pieces\",\"unit_cost\":0,\"total_cost\":0},{\"material_id\":\"30\",\"material_name\":\"Bawang\",\"quantity\":2,\"unit\":\"pieces\",\"unit_cost\":0,\"total_cost\":0}]', 1, NULL, 365, NULL, 'pending', NULL, NULL, NULL, 'Admin User', NULL, '2025-06-19 19:08:11', '2025-06-19 19:08:20'),
(15, 'PROD20250619-5469', 124, 'Piña Tsokolate Bars', 'Snacks', 10, 'normal', 'quality-check', 80.00, '2025-06-19', '2025-06-19 08:00:00', NULL, 8, NULL, 'existing-batch', NULL, 1, NULL, 365, NULL, 'pending', NULL, NULL, NULL, 'Admin User', NULL, '2025-06-19 20:23:16', '2025-06-19 20:23:23');

-- --------------------------------------------------------

--
-- Table structure for table `production_alerts`
--

CREATE TABLE `production_alerts` (
  `id` int(11) NOT NULL,
  `alert_id` varchar(50) NOT NULL,
  `production_id` int(11) DEFAULT NULL,
  `material_id` int(11) DEFAULT NULL,
  `batch_id` int(11) DEFAULT NULL,
  `alert_type` enum('delay','quality','material_shortage','equipment','safety','cost_overrun','temperature','contamination','other') DEFAULT 'other',
  `category` varchar(100) DEFAULT NULL,
  `severity` enum('info','warning','error','critical') DEFAULT 'warning',
  `priority` enum('low','medium','high','critical') DEFAULT 'medium',
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `affected_quantity` decimal(10,3) DEFAULT NULL,
  `estimated_impact` text DEFAULT NULL,
  `status` enum('active','acknowledged','in-progress','resolved','dismissed') DEFAULT 'active',
  `triggered_at` datetime DEFAULT current_timestamp(),
  `acknowledged_by` varchar(255) DEFAULT NULL,
  `acknowledged_at` datetime DEFAULT NULL,
  `resolved_by` varchar(255) DEFAULT NULL,
  `resolved_at` datetime DEFAULT NULL,
  `resolution_notes` text DEFAULT NULL,
  `auto_generated` tinyint(1) DEFAULT 1,
  `escalation_level` int(11) DEFAULT 0,
  `notification_sent` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `production_analytics`
--

CREATE TABLE `production_analytics` (
  `id` int(11) NOT NULL,
  `production_id` int(11) NOT NULL,
  `metric_name` varchar(100) NOT NULL,
  `metric_value` decimal(15,4) NOT NULL,
  `metric_unit` varchar(50) DEFAULT NULL,
  `calculation_method` varchar(255) DEFAULT NULL,
  `benchmark_value` decimal(15,4) DEFAULT NULL,
  `variance_percentage` decimal(8,2) DEFAULT NULL,
  `performance_rating` enum('excellent','good','average','poor','critical') DEFAULT NULL,
  `measurement_date` date NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `production_costs`
--

CREATE TABLE `production_costs` (
  `id` int(11) NOT NULL,
  `production_id` int(11) NOT NULL,
  `cost_type` enum('material','labor','electricity','gas','overhead','equipment','packaging','transportation','other') DEFAULT 'material',
  `cost_category` varchar(100) NOT NULL,
  `description` varchar(255) NOT NULL,
  `quantity` decimal(10,3) DEFAULT 1.000,
  `unit_cost` decimal(10,2) NOT NULL,
  `total_cost` decimal(10,2) NOT NULL,
  `currency` varchar(3) DEFAULT 'PHP',
  `cost_date` date NOT NULL,
  `is_estimated` tinyint(1) DEFAULT 1,
  `supplier_id` int(11) DEFAULT NULL,
  `invoice_number` varchar(100) DEFAULT NULL,
  `allocation_method` enum('direct','proportional','fixed') DEFAULT 'direct',
  `allocation_percentage` decimal(5,2) DEFAULT 100.00,
  `actual_cost` decimal(10,2) DEFAULT NULL,
  `variance` decimal(10,2) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `production_materials`
--

CREATE TABLE `production_materials` (
  `id` int(11) NOT NULL,
  `production_id` int(11) NOT NULL,
  `material_id` int(11) NOT NULL,
  `required_quantity` decimal(10,4) NOT NULL,
  `required_unit` varchar(50) NOT NULL,
  `consumed_quantity` decimal(10,4) DEFAULT 0.0000,
  `consumed_unit` varchar(50) DEFAULT NULL,
  `base_unit_quantity` decimal(10,4) DEFAULT NULL,
  `conversion_factor` decimal(10,6) DEFAULT NULL,
  `containers_opened` int(11) DEFAULT 0,
  `pieces_used` int(11) DEFAULT 0,
  `remaining_in_container` int(11) DEFAULT NULL,
  `material_batches_used` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`material_batches_used`)),
  `estimated_cost` decimal(10,2) DEFAULT 0.00,
  `actual_cost` decimal(10,2) DEFAULT 0.00,
  `waste_quantity` decimal(10,3) DEFAULT 0.000,
  `waste_percentage` decimal(5,2) DEFAULT 0.00,
  `batch_code` varchar(100) DEFAULT NULL,
  `expiration_date` date DEFAULT NULL,
  `consumption_date` datetime DEFAULT NULL,
  `status` enum('planned','reserved','consumed','returned','cancelled') DEFAULT 'planned',
  `allocated_at` timestamp NULL DEFAULT NULL,
  `consumed_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `production_materials`
--

INSERT INTO `production_materials` (`id`, `production_id`, `material_id`, `required_quantity`, `required_unit`, `consumed_quantity`, `consumed_unit`, `base_unit_quantity`, `conversion_factor`, `containers_opened`, `pieces_used`, `remaining_in_container`, `material_batches_used`, `estimated_cost`, `actual_cost`, `waste_quantity`, `waste_percentage`, `batch_code`, `expiration_date`, `consumption_date`, `status`, `allocated_at`, `consumed_at`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, 22, 20.0000, 'oz', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 12000.00, 0.00, 0.000, 0.00, NULL, NULL, NULL, '', NULL, NULL, NULL, '2025-05-26 10:00:27', '2025-05-26 10:00:27'),
(2, 1, 24, 1.0000, 'Pack', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 40.00, 0.00, 0.000, 0.00, NULL, NULL, NULL, '', NULL, NULL, NULL, '2025-05-26 10:00:27', '2025-05-26 10:00:27'),
(3, 6, 22, 10.0000, 'Unit', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 6000.00, 0.00, 0.000, 0.00, NULL, NULL, NULL, '', NULL, NULL, NULL, '2025-06-17 19:49:10', '2025-06-17 19:49:10'),
(4, 6, 27, 5.0000, 'Unit', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 1000.00, 0.00, 0.000, 0.00, NULL, NULL, NULL, '', NULL, NULL, NULL, '2025-06-17 19:49:10', '2025-06-17 19:49:10'),
(12, 14, 22, 10.0000, 'Unit', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 6000.00, 0.00, 0.000, 0.00, NULL, NULL, NULL, '', NULL, NULL, NULL, '2025-06-19 19:08:11', '2025-06-19 19:08:11'),
(13, 14, 30, 2.0000, 'Pieces', 0.0000, NULL, NULL, NULL, 0, 0, NULL, NULL, 200.00, 0.00, 0.000, 0.00, NULL, NULL, NULL, '', NULL, NULL, NULL, '2025-06-19 19:08:11', '2025-06-19 19:08:11');

-- --------------------------------------------------------

--
-- Table structure for table `production_material_usage`
--

CREATE TABLE `production_material_usage` (
  `id` int(11) NOT NULL,
  `production_id` int(11) NOT NULL,
  `production_material_id` int(11) NOT NULL,
  `material_id` int(11) NOT NULL,
  `material_batch_id` int(11) DEFAULT NULL,
  `usage_type` enum('consumption','waste','return','adjustment','transfer') DEFAULT 'consumption',
  `quantity_used` decimal(10,4) NOT NULL,
  `unit_used` varchar(50) NOT NULL,
  `containers_opened` int(11) DEFAULT 0,
  `pieces_consumed` int(11) DEFAULT 0,
  `base_unit_equivalent` decimal(10,4) DEFAULT NULL,
  `conversion_notes` text DEFAULT NULL,
  `batch_code` varchar(100) DEFAULT NULL,
  `expiration_date` date DEFAULT NULL,
  `unit_cost` decimal(10,4) DEFAULT NULL,
  `total_cost` decimal(10,2) DEFAULT NULL,
  `production_step_id` int(11) DEFAULT NULL,
  `used_by` int(11) DEFAULT NULL,
  `usage_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `reason` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `production_output`
--

CREATE TABLE `production_output` (
  `id` int(11) NOT NULL,
  `production_id` int(11) NOT NULL,
  `quantity_produced` int(11) NOT NULL,
  `quantity_passed_qc` int(11) DEFAULT 0,
  `quantity_failed_qc` int(11) DEFAULT 0,
  `quantity_rework` int(11) DEFAULT 0,
  `quality_score` decimal(5,2) DEFAULT NULL,
  `quality_grade` varchar(50) DEFAULT NULL,
  `defect_rate` decimal(5,2) DEFAULT NULL,
  `yield_percentage` decimal(5,2) DEFAULT NULL,
  `output_batch_code` varchar(100) DEFAULT NULL,
  `expiration_date` date DEFAULT NULL,
  `shelf_life_days` int(11) DEFAULT NULL,
  `manufacturing_date` date DEFAULT NULL,
  `material_cost` decimal(10,2) DEFAULT 0.00,
  `labor_cost` decimal(10,2) DEFAULT 0.00,
  `overhead_cost` decimal(10,2) DEFAULT 0.00,
  `total_cost` decimal(10,2) DEFAULT 0.00,
  `created_product_id` int(11) DEFAULT NULL,
  `created_batch_id` int(11) DEFAULT NULL,
  `cost_per_unit` decimal(10,4) DEFAULT 0.0000,
  `packaging_type` varchar(100) DEFAULT NULL,
  `packaging_date` date DEFAULT NULL,
  `storage_location` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `production_output`
--

INSERT INTO `production_output` (`id`, `production_id`, `quantity_produced`, `quantity_passed_qc`, `quantity_failed_qc`, `quantity_rework`, `quality_score`, `quality_grade`, `defect_rate`, `yield_percentage`, `output_batch_code`, `expiration_date`, `shelf_life_days`, `manufacturing_date`, `material_cost`, `labor_cost`, `overhead_cost`, `total_cost`, `created_product_id`, `created_batch_id`, `cost_per_unit`, `packaging_type`, `packaging_date`, `storage_location`, `notes`, `created_at`, `updated_at`) VALUES
(1, 3, 5, 5, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-18', 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0.0000, NULL, NULL, NULL, NULL, '2025-06-17 17:18:52', '2025-06-17 17:18:52'),
(2, 4, 5, 5, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-18', 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0.0000, NULL, NULL, NULL, NULL, '2025-06-17 17:29:02', '2025-06-17 17:29:02'),
(3, 2, 4, 4, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-18', 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0.0000, NULL, NULL, NULL, NULL, '2025-06-17 17:29:09', '2025-06-17 17:29:09'),
(4, 1, 20, 20, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-18', 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0.0000, NULL, NULL, NULL, NULL, '2025-06-17 17:29:12', '2025-06-17 17:29:12'),
(5, 5, 5, 5, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-18', 0.00, 0.00, 0.00, 0.00, NULL, NULL, 0.0000, NULL, NULL, NULL, NULL, '2025-06-17 17:32:48', '2025-06-17 17:32:48');

-- --------------------------------------------------------

--
-- Table structure for table `production_quality_checks`
--

CREATE TABLE `production_quality_checks` (
  `id` int(11) NOT NULL,
  `production_id` int(11) NOT NULL,
  `production_step_id` int(11) DEFAULT NULL,
  `check_type` enum('visual','measurement','chemical','microbiological','sensory','packaging','other') NOT NULL,
  `check_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `expected_value` varchar(255) DEFAULT NULL,
  `actual_value` varchar(255) DEFAULT NULL,
  `tolerance_min` varchar(100) DEFAULT NULL,
  `tolerance_max` varchar(100) DEFAULT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `pass_fail` enum('pass','fail','pending','na') DEFAULT 'pending',
  `severity` enum('low','medium','high','critical') DEFAULT 'medium',
  `checked_by` varchar(100) DEFAULT NULL,
  `checked_at` datetime DEFAULT current_timestamp(),
  `corrective_action` text DEFAULT NULL,
  `recheck_required` tinyint(1) DEFAULT 0,
  `recheck_date` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `production_recipes`
--

CREATE TABLE `production_recipes` (
  `id` int(11) NOT NULL,
  `recipe_id` varchar(50) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `recipe_name` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `version` varchar(20) DEFAULT '1.0',
  `batch_size` int(11) NOT NULL DEFAULT 1,
  `estimated_duration_hours` int(11) DEFAULT 8,
  `difficulty_level` enum('easy','medium','hard','expert') DEFAULT 'medium',
  `ingredients` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`ingredients`)),
  `steps` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`steps`)),
  `equipment_needed` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`equipment_needed`)),
  `quality_standards` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`quality_standards`)),
  `testing_requirements` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`testing_requirements`)),
  `cost_per_batch` decimal(10,2) DEFAULT 0.00,
  `yield_percentage` decimal(5,2) DEFAULT 100.00,
  `shelf_life_days` int(11) DEFAULT 365,
  `storage_requirements` text DEFAULT NULL,
  `allergen_info` text DEFAULT NULL,
  `status` enum('draft','active','inactive','archived','under-review') DEFAULT 'draft',
  `is_default` tinyint(1) DEFAULT 0,
  `description` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `production_recipes`
--

INSERT INTO `production_recipes` (`id`, `recipe_id`, `product_id`, `recipe_name`, `category`, `version`, `batch_size`, `estimated_duration_hours`, `difficulty_level`, `ingredients`, `steps`, `equipment_needed`, `quality_standards`, `testing_requirements`, `cost_per_batch`, `yield_percentage`, `shelf_life_days`, `storage_requirements`, `allergen_info`, `status`, `is_default`, `description`, `notes`, `created_by`, `approved_by`, `approved_at`, `created_at`, `updated_at`) VALUES
(1, NULL, NULL, 'Default Jam Production', 'Preserves', '1.0', 12, 8, 'medium', '[{\"material_name\": \"Fruit\", \"quantity\": 2, \"unit\": \"kg\"}, {\"material_name\": \"Sugar\", \"quantity\": 1.5, \"unit\": \"kg\"}, {\"material_name\": \"Glass Jars\", \"quantity\": 12, \"unit\": \"pieces\"}]', '[{\"step\": 1, \"name\": \"Preparation\", \"description\": \"Wash and prepare fruits\", \"duration\": 30}, {\"step\": 2, \"name\": \"Cooking\", \"description\": \"Cook fruit with sugar\", \"duration\": 120}, {\"step\": 3, \"name\": \"Jarring\", \"description\": \"Fill jars and seal\", \"duration\": 45}, {\"step\": 4, \"name\": \"Quality Check\", \"description\": \"Check seals and quality\", \"duration\": 15}]', NULL, NULL, NULL, 0.00, 100.00, 365, NULL, NULL, 'active', 0, NULL, NULL, NULL, NULL, NULL, '2025-05-26 09:53:40', '2025-05-26 09:53:40'),
(2, NULL, NULL, 'Pineapple Jam Standard', 'Pineapple Jam', '1.0', 24, 8, 'medium', '[{\"material_name\": \"Fresh Pineapple\", \"quantity\": 3, \"unit\": \"kg\"}, {\"material_name\": \"Sugar\", \"quantity\": 2, \"unit\": \"kg\"}, {\"material_name\": \"Lemon Juice\", \"quantity\": 100, \"unit\": \"ml\"}, {\"material_name\": \"Glass Jars\", \"quantity\": 24, \"unit\": \"pieces\"}]', '[{\"step\": 1, \"name\": \"Fruit Preparation\", \"description\": \"Peel and dice pineapple\", \"duration\": 45}, {\"step\": 2, \"name\": \"Cooking\", \"description\": \"Cook pineapple with sugar and lemon\", \"duration\": 90}, {\"step\": 3, \"name\": \"Consistency Check\", \"description\": \"Test jam consistency\", \"duration\": 10}, {\"step\": 4, \"name\": \"Jarring\", \"description\": \"Fill sterilized jars\", \"duration\": 30}, {\"step\": 5, \"name\": \"Sealing\", \"description\": \"Seal and label jars\", \"duration\": 20}, {\"step\": 6, \"name\": \"Quality Control\", \"description\": \"Final quality inspection\", \"duration\": 15}]', NULL, NULL, NULL, 0.00, 100.00, 365, NULL, NULL, 'active', 0, NULL, NULL, NULL, NULL, NULL, '2025-05-26 09:53:40', '2025-05-26 09:53:40');

-- --------------------------------------------------------

--
-- Table structure for table `production_status_history`
--

CREATE TABLE `production_status_history` (
  `id` int(11) NOT NULL,
  `production_id` int(11) NOT NULL,
  `previous_status` varchar(50) DEFAULT NULL,
  `new_status` varchar(50) NOT NULL,
  `changed_at` datetime DEFAULT current_timestamp(),
  `changed_by` varchar(100) DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `duration_in_previous_status` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `production_steps`
--

CREATE TABLE `production_steps` (
  `id` int(11) NOT NULL,
  `production_id` int(11) NOT NULL,
  `step_number` int(11) NOT NULL,
  `step_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('pending','in-progress','completed','skipped','failed','on-hold') DEFAULT 'pending',
  `estimated_duration_minutes` int(11) DEFAULT NULL,
  `actual_duration_minutes` int(11) DEFAULT NULL,
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `completed_by` int(11) DEFAULT NULL,
  `depends_on_step` int(11) DEFAULT NULL,
  `requires_quality_check` tinyint(1) DEFAULT 0,
  `quality_checked` tinyint(1) DEFAULT 0,
  `quality_notes` text DEFAULT NULL,
  `instructions` text DEFAULT NULL,
  `temperature_required` decimal(5,2) DEFAULT NULL,
  `pressure_required` decimal(5,2) DEFAULT NULL,
  `equipment_needed` text DEFAULT NULL,
  `safety_notes` text DEFAULT NULL,
  `quality_checkpoints` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `production_steps`
--

INSERT INTO `production_steps` (`id`, `production_id`, `step_number`, `step_name`, `description`, `status`, `estimated_duration_minutes`, `actual_duration_minutes`, `started_at`, `completed_at`, `assigned_to`, `completed_by`, `depends_on_step`, `requires_quality_check`, `quality_checked`, `quality_notes`, `instructions`, `temperature_required`, `pressure_required`, `equipment_needed`, `safety_notes`, `quality_checkpoints`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'Material Preparation', 'Gather and prepare all materials', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-05-26 10:00:27', '2025-05-26 10:00:27'),
(2, 1, 2, 'Production Setup', 'Set up equipment and workspace', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-05-26 10:00:27', '2025-05-26 10:00:27'),
(3, 1, 3, 'Production Process', 'Execute main production process', 'pending', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-05-26 10:00:27', '2025-05-26 10:00:27'),
(4, 1, 4, 'Quality Control', 'Quality inspection and testing', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-05-26 10:00:27', '2025-05-26 10:00:27'),
(5, 1, 5, 'Packaging', 'Package finished products', 'pending', 45, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-05-26 10:00:27', '2025-05-26 10:00:27'),
(6, 1, 6, 'Final Inspection', 'Final quality check and documentation', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-05-26 10:00:27', '2025-05-26 10:00:27'),
(7, 2, 1, 'Material Preparation', 'Gather and prepare all materials', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-17 15:36:36', '2025-06-17 15:36:36'),
(8, 2, 2, 'Production Setup', 'Set up equipment and workspace', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-17 15:36:36', '2025-06-17 15:36:36'),
(9, 2, 3, 'Production Process', 'Execute main production process', 'pending', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-17 15:36:36', '2025-06-17 15:36:36'),
(10, 2, 4, 'Quality Control', 'Quality inspection and testing', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-17 15:36:36', '2025-06-17 15:36:36'),
(11, 2, 5, 'Packaging', 'Package finished products', 'pending', 45, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-17 15:36:36', '2025-06-17 15:36:36'),
(12, 2, 6, 'Final Inspection', 'Final quality check and documentation', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-17 15:36:36', '2025-06-17 15:36:36'),
(13, 3, 1, 'Material Preparation', 'Gather and prepare all materials', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-17 17:18:42', '2025-06-17 17:18:42'),
(14, 3, 2, 'Production Setup', 'Set up equipment and workspace', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-17 17:18:42', '2025-06-17 17:18:42'),
(15, 3, 3, 'Production Process', 'Execute main production process', 'pending', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-17 17:18:42', '2025-06-17 17:18:42'),
(16, 3, 4, 'Quality Control', 'Quality inspection and testing', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-17 17:18:42', '2025-06-17 17:18:42'),
(17, 3, 5, 'Packaging', 'Package finished products', 'pending', 45, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-17 17:18:42', '2025-06-17 17:18:42'),
(18, 3, 6, 'Final Inspection', 'Final quality check and documentation', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-17 17:18:42', '2025-06-17 17:18:42'),
(19, 4, 1, 'Material Preparation', 'Gather and prepare all materials', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-17 17:19:36', '2025-06-17 17:19:36'),
(20, 4, 2, 'Production Setup', 'Set up equipment and workspace', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-17 17:19:36', '2025-06-17 17:19:36'),
(21, 4, 3, 'Production Process', 'Execute main production process', 'pending', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-17 17:19:36', '2025-06-17 17:19:36'),
(22, 4, 4, 'Quality Control', 'Quality inspection and testing', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-17 17:19:36', '2025-06-17 17:19:36'),
(23, 4, 5, 'Packaging', 'Package finished products', 'pending', 45, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-17 17:19:36', '2025-06-17 17:19:36'),
(24, 4, 6, 'Final Inspection', 'Final quality check and documentation', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-17 17:19:36', '2025-06-17 17:19:36'),
(25, 5, 1, 'Material Preparation', 'Gather and prepare all materials', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-17 17:32:29', '2025-06-17 17:32:29'),
(26, 5, 2, 'Production Setup', 'Set up equipment and workspace', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-17 17:32:29', '2025-06-17 17:32:29'),
(27, 5, 3, 'Production Process', 'Execute main production process', 'pending', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-17 17:32:29', '2025-06-17 17:32:29'),
(28, 5, 4, 'Quality Control', 'Quality inspection and testing', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-17 17:32:29', '2025-06-17 17:32:29'),
(29, 5, 5, 'Packaging', 'Package finished products', 'pending', 45, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-17 17:32:29', '2025-06-17 17:32:29'),
(30, 5, 6, 'Final Inspection', 'Final quality check and documentation', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-17 17:32:29', '2025-06-17 17:32:29'),
(31, 6, 1, 'Material Preparation', 'Gather and prepare all materials', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-17 19:49:10', '2025-06-17 19:49:10'),
(32, 6, 2, 'Production Setup', 'Set up equipment and workspace', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-17 19:49:10', '2025-06-17 19:49:10'),
(33, 6, 3, 'Production Process', 'Execute main production process', 'pending', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-17 19:49:10', '2025-06-17 19:49:10'),
(34, 6, 4, 'Quality Control', 'Quality inspection and testing', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-17 19:49:10', '2025-06-17 19:49:10'),
(35, 6, 5, 'Packaging', 'Package finished products', 'pending', 45, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-17 19:49:10', '2025-06-17 19:49:10'),
(36, 6, 6, 'Final Inspection', 'Final quality check and documentation', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-17 19:49:10', '2025-06-17 19:49:10'),
(37, 7, 1, 'Material Preparation', 'Gather and prepare all materials', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-17 19:51:17', '2025-06-17 19:51:17'),
(38, 7, 2, 'Production Setup', 'Set up equipment and workspace', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-17 19:51:17', '2025-06-17 19:51:17'),
(39, 7, 3, 'Production Process', 'Execute main production process', 'pending', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-17 19:51:17', '2025-06-17 19:51:17'),
(40, 7, 4, 'Quality Control', 'Quality inspection and testing', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-17 19:51:17', '2025-06-17 19:51:17'),
(41, 7, 5, 'Packaging', 'Package finished products', 'pending', 45, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-17 19:51:17', '2025-06-17 19:51:17'),
(42, 7, 6, 'Final Inspection', 'Final quality check and documentation', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-17 19:51:17', '2025-06-17 19:51:17'),
(79, 14, 1, 'Material Preparation', 'Gather and prepare all materials', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-19 19:08:11', '2025-06-19 19:08:11'),
(80, 14, 2, 'Production Setup', 'Set up equipment and workspace', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-19 19:08:11', '2025-06-19 19:08:11'),
(81, 14, 3, 'Production Process', 'Execute main production process', 'pending', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-19 19:08:11', '2025-06-19 19:08:11'),
(82, 14, 4, 'Quality Control', 'Quality inspection and testing', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-19 19:08:11', '2025-06-19 19:08:11'),
(83, 14, 5, 'Packaging', 'Package finished products', 'pending', 45, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-19 19:08:11', '2025-06-19 19:08:11'),
(84, 14, 6, 'Final Inspection', 'Final quality check and documentation', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-19 19:08:11', '2025-06-19 19:08:11'),
(85, 15, 1, 'Material Preparation', 'Gather and prepare all materials', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-19 20:23:16', '2025-06-19 20:23:16'),
(86, 15, 2, 'Production Setup', 'Set up equipment and workspace', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-19 20:23:16', '2025-06-19 20:23:16'),
(87, 15, 3, 'Production Process', 'Execute main production process', 'pending', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-19 20:23:16', '2025-06-19 20:23:16'),
(88, 15, 4, 'Quality Control', 'Quality inspection and testing', 'pending', 30, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-19 20:23:16', '2025-06-19 20:23:16'),
(89, 15, 5, 'Packaging', 'Package finished products', 'pending', 45, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-19 20:23:16', '2025-06-19 20:23:16'),
(90, 15, 6, 'Final Inspection', 'Final quality check and documentation', 'pending', 15, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-19 20:23:16', '2025-06-19 20:23:16');

-- --------------------------------------------------------

--
-- Table structure for table `production_waste`
--

CREATE TABLE `production_waste` (
  `id` int(11) NOT NULL,
  `production_id` int(11) NOT NULL,
  `material_id` int(11) DEFAULT NULL,
  `waste_type` enum('material','product','packaging','energy','time') NOT NULL,
  `waste_category` enum('normal','defective','expired','damaged','spillage','overproduction') NOT NULL,
  `quantity` decimal(10,3) NOT NULL,
  `unit` varchar(50) NOT NULL,
  `cost_impact` decimal(10,2) DEFAULT 0.00,
  `cause` varchar(255) DEFAULT NULL,
  `prevention_action` text DEFAULT NULL,
  `disposal_method` varchar(255) DEFAULT NULL,
  `environmental_impact` text DEFAULT NULL,
  `recorded_by` varchar(255) DEFAULT NULL,
  `recorded_at` datetime DEFAULT current_timestamp(),
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `product_photo` varchar(255) DEFAULT NULL,
  `product_name` varchar(100) NOT NULL,
  `category` varchar(50) NOT NULL,
  `stocks` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `expiration_date` date NOT NULL,
  `batch_tracking` tinyint(1) DEFAULT 1,
  `status` enum('In Stock','Low Stock','Out of Stock') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_from_production` tinyint(1) DEFAULT 0,
  `production_reference` varchar(50) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `product_id`, `product_photo`, `product_name`, `category`, `stocks`, `price`, `expiration_date`, `batch_tracking`, `status`, `created_at`, `updated_at`, `created_from_production`, `production_reference`, `created_by`) VALUES
(116, 'P029', 'uploads/product_67e6e2d540455.png', 'Piña Bars', 'Snacks', 2, 130.00, '0000-00-00', 1, 'Low Stock', '2025-03-28 17:56:37', '2025-05-03 06:03:24', 0, NULL, NULL),
(117, 'P030', 'uploads/product_67e6e2fd9095d.png', 'Piña Putoseko', 'Snacks', 29, 50.00, '0000-00-00', 1, 'In Stock', '2025-03-28 17:57:17', '2025-05-03 06:20:10', 0, NULL, NULL),
(118, 'P031', 'uploads/product_67e6e32751406.png', 'Piña Tuyo', 'Preserves', 16, 180.00, '2025-05-31', 1, 'Low Stock', '2025-03-28 17:57:59', '2025-05-26 11:29:36', 0, NULL, NULL),
(120, 'P033', 'uploads/product_67e6e36976974.png', 'Pineapple Concentrate', 'Preserves', 16, 130.00, '2025-05-29', 1, 'Low Stock', '2025-03-28 17:59:05', '2025-05-06 18:37:52', 0, NULL, NULL),
(122, 'P034', 'uploads/product_67e77ea45ac5b.png', 'Piña Dishwashing Soap', 'Detergent', 20, 60.00, '0000-00-00', 0, 'Low Stock', '2025-03-28 18:11:20', '2025-05-05 05:17:45', 0, NULL, NULL),
(123, 'P035', 'uploads/product_67e77e3c6f5f5.png', 'Piña Mangga Bars', 'Snacks', 35, 130.00, '2025-05-29', 1, 'In Stock', '2025-03-29 04:59:27', '2025-05-03 06:06:28', 0, NULL, NULL),
(124, 'P036', 'uploads/product_67e77e7b29715.png', 'Piña Tsokolate Bars', 'Snacks', 118, 130.00, '2025-05-29', 1, 'In Stock', '2025-03-29 05:00:03', '2025-05-07 00:09:59', 0, NULL, NULL),
(144, 'P039', 'uploads/product_68258f7107667.png', 'Sponge', 'Detergent', 99, 20.00, '0000-00-00', 0, 'In Stock', '2025-04-23 13:39:45', '2025-05-15 06:53:37', 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `product_batches`
--

CREATE TABLE `product_batches` (
  `batch_id` int(11) NOT NULL,
  `product_id` varchar(20) NOT NULL,
  `batch_code` varchar(50) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `expiration_date` date NOT NULL,
  `manufacturing_date` date DEFAULT NULL,
  `unit_cost` decimal(10,2) DEFAULT 0.00,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `custom_duration_days` int(11) DEFAULT NULL,
  `expiration_duration` varchar(10) DEFAULT NULL,
  `custom_duration_value` int(11) DEFAULT NULL,
  `custom_duration_unit` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_batches`
--

INSERT INTO `product_batches` (`batch_id`, `product_id`, `batch_code`, `quantity`, `expiration_date`, `manufacturing_date`, `unit_cost`, `created_at`, `updated_at`, `custom_duration_days`, `expiration_duration`, `custom_duration_value`, `custom_duration_unit`) VALUES
(136, 'P012', '20250324-218', 20, '2025-05-23', '2025-03-23', 0.00, '2025-03-24 04:44:26', '2025-03-24 04:44:26', NULL, NULL, NULL, NULL),
(166, 'P021', '20250324-982', 30, '2025-05-24', '2025-03-24', 0.00, '2025-03-24 23:19:32', '2025-03-24 23:19:32', NULL, NULL, NULL, NULL),
(169, 'P021', '20250324-849', 10, '2025-05-24', '2025-03-24', 0.00, '2025-03-24 23:36:34', '2025-03-24 23:36:34', NULL, NULL, NULL, NULL),
(170, 'P021', '20250324-849', 10, '2025-05-24', '0000-00-00', 0.00, '2025-03-24 23:36:34', '2025-03-25 18:26:05', NULL, NULL, NULL, NULL),
(171, 'P021', '20250324-849', 10, '2025-05-24', '2025-03-24', 0.00, '2025-03-24 23:36:34', '2025-03-24 23:36:34', NULL, NULL, NULL, NULL),
(172, 'P021', '20250324-473', 52, '2025-05-24', '0000-00-00', 0.00, '2025-03-24 23:38:02', '2025-03-25 19:03:19', NULL, NULL, NULL, NULL),
(174, 'P023', '20250324-125', 50, '2025-05-25', '0000-00-00', 0.00, '2025-03-24 23:39:59', '2025-03-25 19:01:42', NULL, NULL, NULL, NULL),
(175, 'P023', '20250324-904', 20, '2025-05-25', '0000-00-00', 0.00, '2025-03-24 23:40:11', '2025-03-25 18:47:30', NULL, NULL, NULL, NULL),
(176, 'P025', '20250324-015', 50, '2025-05-24', '2025-03-24', 0.00, '2025-03-24 23:41:44', '2025-03-24 23:41:44', NULL, NULL, NULL, NULL),
(177, 'P023', '20250325-572', 15, '2025-05-25', '0000-00-00', 0.00, '2025-03-25 00:14:11', '2025-03-25 18:24:49', NULL, NULL, NULL, NULL),
(178, 'P023', '20250325-762', 20, '2025-05-25', '0000-00-00', 0.00, '2025-03-25 17:59:47', '2025-03-25 18:19:53', NULL, NULL, NULL, NULL),
(179, 'P023', '20250325-762', 21, '2025-05-25', '0000-00-00', 0.00, '2025-03-25 17:59:47', '2025-03-25 17:59:47', NULL, NULL, NULL, NULL),
(180, 'P023', '20250325-695', 20, '2025-05-25', '0000-00-00', 0.00, '2025-03-25 18:32:43', '2025-03-25 18:32:43', NULL, NULL, NULL, NULL),
(186, 'P021', '20250325-320', 100, '2025-05-25', '0000-00-00', 0.00, '2025-03-25 19:03:31', '2025-03-25 19:03:31', NULL, NULL, NULL, NULL),
(188, 'P027', '20250325-309', 51, '2025-05-25', '0000-00-00', 0.00, '2025-03-25 19:26:33', '2025-03-25 22:15:21', NULL, NULL, NULL, NULL),
(189, 'P027', '20250325-862', 30, '2025-05-25', '0000-00-00', 0.00, '2025-03-25 19:26:56', '2025-03-25 20:04:19', NULL, NULL, NULL, NULL),
(190, 'P027', '20250325-862', 32, '2025-05-25', '0000-00-00', 0.00, '2025-03-25 19:26:56', '2025-03-25 20:18:22', NULL, NULL, NULL, NULL),
(200, 'P027', '20250325-709', 10, '2025-05-25', '0000-00-00', 0.00, '2025-03-25 20:19:29', '2025-03-25 20:19:49', NULL, NULL, NULL, NULL),
(203, 'P027', '20250325-305', 20, '2025-05-25', '0000-00-00', 0.00, '2025-03-25 23:17:55', '2025-03-25 23:17:55', NULL, NULL, NULL, NULL),
(251, 'P029', '20250329-959', 2, '2025-05-28', '2025-03-28', 0.00, '2025-03-29 01:56:37', '2025-05-03 14:03:24', NULL, NULL, NULL, NULL),
(252, 'P030', '20250329-563', 35, '2025-05-28', '2025-03-28', 0.00, '2025-03-29 01:57:17', '2025-05-03 14:20:10', NULL, NULL, NULL, NULL),
(253, 'P031', '20250329-320', 0, '2025-05-28', '2025-03-28', 0.00, '2025-03-29 01:57:59', '2025-03-31 08:54:06', NULL, NULL, NULL, NULL),
(255, 'P033', '20250329-619', 0, '2025-05-28', '2025-03-28', 0.00, '2025-03-29 01:59:05', '2025-05-03 14:18:30', NULL, NULL, NULL, NULL),
(256, 'P035', '20250329-514', 25, '2025-05-29', '2025-03-29', 0.00, '2025-03-29 12:59:27', '2025-05-03 14:06:28', NULL, NULL, NULL, NULL),
(257, 'P036', '20250329-067', 29, '2025-05-29', '2025-03-29', 0.00, '2025-03-29 13:00:03', '2025-05-07 08:09:59', NULL, NULL, NULL, NULL),
(258, 'P033', '20250329-408', 17, '2025-05-29', '0000-00-00', 0.00, '2025-03-29 23:06:02', '2025-05-07 02:37:52', NULL, '', NULL, NULL),
(268, 'P031', '20250331-062', 18, '2025-05-31', '0000-00-00', 0.00, '2025-03-31 08:53:09', '2025-05-26 19:29:36', NULL, '', NULL, NULL),
(269, 'P036', '20250411-703', 55, '2025-06-11', '0000-00-00', 0.00, '2025-04-11 20:00:00', '2025-04-11 20:00:00', NULL, NULL, NULL, NULL),
(270, 'P036', '20250412-098', 55, '2025-06-12', '0000-00-00', 0.00, '2025-04-12 14:57:14', '2025-04-21 06:37:00', NULL, NULL, NULL, NULL),
(275, 'P035', '20250425-421', 12, '2025-09-25', '0000-00-00', 0.00, '2025-04-25 17:58:16', '2025-04-25 17:58:16', NULL, '5m', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `product_price_history`
--

CREATE TABLE `product_price_history` (
  `history_id` int(11) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `retailer_id` int(11) NOT NULL,
  `previous_price` decimal(10,2) NOT NULL,
  `new_price` decimal(10,2) NOT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_pricing`
--

CREATE TABLE `product_pricing` (
  `pricing_id` int(11) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `retailer_id` int(11) NOT NULL,
  `retail_price` decimal(10,2) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quality_checkpoints`
--

CREATE TABLE `quality_checkpoints` (
  `id` int(11) NOT NULL,
  `checkpoint_id` varchar(50) NOT NULL,
  `production_id` int(11) NOT NULL,
  `production_step_id` int(11) DEFAULT NULL,
  `checkpoint_name` varchar(255) NOT NULL,
  `checkpoint_type` enum('visual','measurement','test','sample') DEFAULT 'visual',
  `parameter_name` varchar(255) NOT NULL,
  `target_value` varchar(100) DEFAULT NULL,
  `tolerance_min` varchar(100) DEFAULT NULL,
  `tolerance_max` varchar(100) DEFAULT NULL,
  `actual_value` varchar(100) DEFAULT NULL,
  `unit_of_measure` varchar(50) DEFAULT NULL,
  `status` enum('pending','passed','failed','skipped') DEFAULT 'pending',
  `inspector` varchar(255) DEFAULT NULL,
  `inspection_date` datetime DEFAULT NULL,
  `equipment_used` varchar(255) DEFAULT NULL,
  `method` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `corrective_action` text DEFAULT NULL,
  `attachments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attachments`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quality_checkpoints`
--

INSERT INTO `quality_checkpoints` (`id`, `checkpoint_id`, `production_id`, `production_step_id`, `checkpoint_name`, `checkpoint_type`, `parameter_name`, `target_value`, `tolerance_min`, `tolerance_max`, `actual_value`, `unit_of_measure`, `status`, `inspector`, `inspection_date`, `equipment_used`, `method`, `notes`, `corrective_action`, `attachments`, `created_at`, `updated_at`) VALUES
(3, '', 7, NULL, 'Final Quality Check', '', '', NULL, NULL, NULL, '100', NULL, '', 'Quality Inspector', '2025-06-19 10:03:00', NULL, NULL, '', NULL, NULL, '2025-06-19 10:03:44', '2025-06-19 10:03:44');

-- --------------------------------------------------------

--
-- Table structure for table `raw_materials`
--

CREATE TABLE `raw_materials` (
  `id` int(11) NOT NULL,
  `material_id` varchar(10) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(50) NOT NULL,
  `quantity` decimal(10,2) NOT NULL DEFAULT 0.00,
  `measurement_type` varchar(20) NOT NULL,
  `unit_measurement` varchar(20) DEFAULT NULL,
  `base_unit` varchar(50) DEFAULT NULL,
  `pieces_per_container` int(11) DEFAULT NULL,
  `pieces_total_unit_measurement` int(11) DEFAULT NULL,
  `cost` decimal(10,2) NOT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `is_alternative_supplier` enum('yes','no') DEFAULT 'no',
  `alternative_supplier` varchar(255) DEFAULT NULL,
  `date_received` date NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `receipt_file` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `container_status` enum('unopened','opened','mixed') DEFAULT 'unopened',
  `opened_containers` int(11) DEFAULT 0,
  `remaining_in_opened` decimal(10,3) DEFAULT 0.000
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `raw_materials`
--

INSERT INTO `raw_materials` (`id`, `material_id`, `name`, `category`, `quantity`, `measurement_type`, `unit_measurement`, `base_unit`, `pieces_per_container`, `pieces_total_unit_measurement`, `cost`, `supplier_id`, `is_alternative_supplier`, `alternative_supplier`, `date_received`, `expiry_date`, `receipt_file`, `notes`, `created_at`, `updated_at`, `container_status`, `opened_containers`, `remaining_in_opened`) VALUES
(22, 'M010', 'Garapon', 'Packaging', 20.00, 'Unit', 'oz', 'pieces', 0, NULL, 600.00, 9, '', NULL, '2025-05-25', NULL, NULL, '', '2025-05-25 12:41:14', '2025-05-25 16:47:27', 'unopened', 0, 0.000),
(24, 'M012', 'Plastic', 'Packaging', 2.00, 'Pack', NULL, 'pieces', 100, NULL, 40.00, 9, 'no', NULL, '2025-05-25', NULL, NULL, '', '2025-05-25 14:06:57', '2025-05-27 15:28:47', 'unopened', 0, 0.000),
(26, 'M014', 'Magic Sarap', 'Ingredients', 35.00, 'Unit', 'kg', 'g', 0, NULL, 525.00, 9, 'no', NULL, '2025-05-25', NULL, NULL, '', '2025-05-25 15:00:41', '2025-05-26 17:09:37', 'unopened', 0, 0.000),
(27, 'M015', 'Honey', 'Sweeteners', 10.00, 'Unit', 'ml', 'ml', 0, NULL, 200.00, 2, '', NULL, '2025-05-25', NULL, 'uploads/receipts/1748186658_SQL Server Database Creation and Management (1).pdf', 'epsilon', '2025-05-25 15:24:18', '2025-05-25 15:37:39', 'unopened', 0, 0.000),
(29, 'M016', 'Pouches', 'Packaging', 2.00, 'Box', NULL, 'pieces', 20, NULL, 200.00, 9, 'no', NULL, '2025-05-27', NULL, NULL, '', '2025-05-27 13:25:12', '2025-05-27 13:25:12', 'unopened', 0, 0.000),
(30, 'M017', 'Bawang', 'Ingredients', 20.00, 'Pieces', NULL, 'pieces', 0, NULL, 100.00, 2, 'no', NULL, '2025-05-28', '2025-07-09', NULL, '', '2025-05-27 16:48:28', '2025-05-27 16:48:28', 'unopened', 0, 0.000),
(31, 'M018', 'Sibuyas na Puti', 'Ingredients', 500.00, 'Unit', 'kg', 'g', 0, NULL, 5000.00, 2, 'no', NULL, '2025-04-30', NULL, 'uploads/receipts/1748413328_2022-08-16.png', '', '2025-05-28 06:22:08', '2025-05-28 06:22:08', 'unopened', 0, 0.000);

-- --------------------------------------------------------

--
-- Table structure for table `retailer_orders`
--

CREATE TABLE `retailer_orders` (
  `order_id` int(11) NOT NULL,
  `po_number` varchar(20) NOT NULL,
  `retailer_name` varchar(100) NOT NULL,
  `retailer_email` varchar(100) NOT NULL,
  `retailer_contact` varchar(20) NOT NULL,
  `order_date` date NOT NULL,
  `expected_delivery` date DEFAULT NULL,
  `delivery_mode` varchar(20) DEFAULT 'delivery',
  `pickup_location` varchar(255) DEFAULT NULL,
  `pickup_date` date DEFAULT NULL,
  `status` enum('order','confirmed','shipped','delivered','ready-to-pickup','picked up','cancelled','completed','return_requested','returned') NOT NULL,
  `pickup_status` enum('order','confirmed','ready-to-pickup','picked up','cancelled','completed','return_requested','returned') NOT NULL,
  `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `tax` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `payment_status` enum('pending','partial','paid') NOT NULL DEFAULT 'pending',
  `consignment_term` int(11) DEFAULT 30,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `delivery_proof_photo` varchar(255) DEFAULT NULL,
  `pickup_person_name` varchar(100) DEFAULT NULL,
  `pickup_id_verified` tinyint(1) DEFAULT 0,
  `pickup_notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `retailer_orders`
--

INSERT INTO `retailer_orders` (`order_id`, `po_number`, `retailer_name`, `retailer_email`, `retailer_contact`, `order_date`, `expected_delivery`, `delivery_mode`, `pickup_location`, `pickup_date`, `status`, `pickup_status`, `subtotal`, `tax`, `discount`, `total_amount`, `payment_status`, `consignment_term`, `notes`, `created_at`, `updated_at`, `delivery_proof_photo`, `pickup_person_name`, `pickup_id_verified`, `pickup_notes`) VALUES
(286, 'RO-20250428-007', 'Fyave Targaryen', 'fyavetargaryen@gmail.com', '+639495027266', '2025-04-28', '0000-00-00', 'pickup', 'Pinana Gourmet Calauan', '2025-05-01', 'completed', 'completed', 180.00, 0.00, 0.00, 180.00, 'paid', 30, '', '2025-04-28 12:46:50', '2025-05-25 06:32:47', NULL, NULL, 0, NULL),
(293, 'RO-20250428-014', 'Fyave Targaryen', 'fyavetargaryen@gmail.com', '+639495027266', '2025-04-28', '2025-05-05', 'delivery', '', '0000-00-00', 'completed', 'order', 1560.00, 0.00, 0.00, 1560.00, 'paid', 30, '', '2025-04-28 15:55:10', '2025-05-15 03:54:39', NULL, NULL, 0, NULL),
(302, 'RO-20250429-001', 'Sevence Targaryens', 'sevencetargaryen@gmail.com', '+639837483937', '2025-04-29', '2025-05-06', 'delivery', '', '0000-00-00', 'completed', 'order', 20.00, 0.00, 0.00, 20.00, 'pending', 30, 'Order has been delivered', '2025-04-29 04:23:44', '2025-04-30 08:39:39', 'uploads/delivery_proofs/1745903884_Background.png', NULL, 0, NULL),
(305, 'RO-20250429-003', 'Fyave Targaryen', 'fyavetargaryen@gmail.com', '+639495027266', '2025-04-29', '0000-00-00', 'pickup', 'Pinana Gourmet Calauan', '2025-05-02', 'return_requested', 'return_requested', 130.00, 0.00, 0.00, 130.00, 'pending', 30, 'Order picked up by Fyave', '2025-04-29 05:54:48', '2025-05-05 11:19:34', NULL, 'Fyave', 1, ''),
(306, 'RO-20250429-004', 'Sevence Targaryens', 'sevencetargaryen@gmail.com', '+639837483937', '2025-04-29', '0000-00-00', 'pickup', 'Pinana Gourmet Calauan', '2025-05-02', 'completed', 'completed', 130.00, 0.00, 0.00, 130.00, 'pending', 30, 'Order picked up by Fyave', '2025-04-29 05:54:59', '2025-05-01 08:55:14', NULL, 'Fyave', 1, ''),
(307, 'RO-20250429-005', 'Sevence Targaryens', 'sevencetargaryen@gmail.com', '+639837483937', '2025-04-29', '0000-00-00', 'pickup', 'Pinana Gourmet Calauan', '2025-05-02', 'completed', 'completed', 20.00, 0.00, 0.00, 20.00, 'pending', 30, 'Order picked up by Sevence', '2025-04-29 06:22:13', '2025-05-02 14:23:05', NULL, 'Sevence', 1, ''),
(308, 'RO-20250429-006', 'Van Clive', 'vanngaming2003@gmail.com', '+639749374734', '2025-04-29', '0000-00-00', 'pickup', 'Pinana Gourmet Calauan', '2025-05-02', '', '', 130.00, 0.00, 0.00, 130.00, 'pending', 30, 'Order picked up by Van', '2025-04-29 06:34:01', '2025-04-29 08:29:20', NULL, 'Van', 1, ''),
(309, 'RO-20250429-007', 'Siex Targaryen', 'siextargaryen@gmail.com', '+6397463837465', '2025-04-29', '0000-00-00', 'pickup', 'Pinana Gourmet Calauan', '2025-05-02', 'completed', 'completed', 20.00, 0.00, 0.00, 20.00, 'pending', 30, 'Order picked up by Siex', '2025-04-29 07:08:29', '2025-05-06 09:59:39', NULL, 'Siex', 1, ''),
(310, 'RO-20250429-008', 'Van Clive', 'vanngaming2003@gmail.com', '+639749374734', '2025-04-29', '2025-05-06', 'delivery', '', '0000-00-00', '', 'order', 130.00, 0.00, 0.00, 130.00, 'pending', 30, 'Order has been delivered', '2025-04-29 07:37:06', '2025-04-29 08:28:13', 'uploads/delivery_proofs/1745912264_Header1.png', NULL, 0, NULL),
(312, 'RO-20250429-010', 'Van Clive', 'vanngaming2003@gmail.com', '+639749374734', '2025-04-29', '2025-05-06', 'delivery', '', '0000-00-00', 'completed', 'order', 130.00, 0.00, 0.00, 130.00, 'pending', 30, 'Order has been delivered', '2025-04-29 08:50:15', '2025-04-30 13:24:10', 'uploads/delivery_proofs/1745916693_final-light.png', NULL, 0, NULL),
(313, 'RO-20250429-011', 'Van Clive', 'vanngaming2003@gmail.com', '+639749374734', '2025-04-29', '2025-05-06', 'delivery', '', '0000-00-00', 'shipped', 'order', 130.00, 0.00, 0.00, 130.00, 'pending', 30, '', '2025-04-29 09:30:24', '2025-05-03 18:28:00', NULL, NULL, 0, NULL),
(314, 'RO-20250429-012', 'Sevence Targaryens', 'sevencetargaryen@gmail.com', '+639837483937', '2025-04-29', '0000-00-00', 'pickup', 'Pinana Gourmet Calauan', '2025-05-02', 'completed', 'completed', 130.00, 0.00, 0.00, 130.00, 'pending', 30, 'Order picked up by Sevence', '2025-04-29 10:00:03', '2025-04-30 12:03:11', NULL, 'Sevence', 1, ''),
(315, 'RO-20250429-013', 'Van Clive', 'vanngaming2003@gmail.com', '+639749374734', '2025-04-29', '2025-05-06', 'delivery', '', '0000-00-00', '', 'order', 130.00, 0.00, 0.00, 130.00, 'pending', 30, 'Order has been delivered', '2025-04-29 10:02:21', '2025-04-29 11:22:55', 'uploads/delivery_proofs/1745920983_Header1.png', NULL, 0, NULL),
(316, 'RO-20250429-014', 'Van Clive', 'vanngaming2003@gmail.com', '+639749374734', '2025-04-29', '0000-00-00', 'pickup', 'Pinana Gourmet Calauan', '2025-05-02', '', '', 130.00, 0.00, 0.00, 130.00, 'pending', 30, 'Order picked up by Van', '2025-04-29 10:14:18', '2025-04-29 11:23:51', NULL, 'Van', 1, ''),
(317, 'RO-20250429-015', 'Sevence Targaryens', 'sevencetargaryen@gmail.com', '+639837483937', '2025-04-29', '2025-05-06', 'delivery', '', '0000-00-00', 'completed', 'order', 130.00, 0.00, 0.00, 130.00, 'pending', 30, 'Order has been delivered', '2025-04-29 10:50:35', '2025-05-01 09:35:51', 'uploads/delivery_proofs/1746092134_IMG_20250415_102032_428.jpg', NULL, 0, NULL),
(318, 'RO-20250429-016', 'Tuh Targaryen', 'tuhtargaryen@gmail.com', '+639949407497', '2025-04-29', '0000-00-00', 'pickup', 'Pinana Gourmet Calauan', '2025-05-02', 'completed', 'completed', 180.00, 0.00, 0.00, 180.00, 'paid', 30, 'Order picked up by Tuh', '2025-04-29 10:59:18', '2025-05-06 11:04:02', NULL, 'Tuh', 1, ''),
(319, 'RO-20250429-017', 'Tuh Targaryen', 'tuhtargaryen@gmail.com', '+639949407497', '2025-04-29', '2025-05-06', 'delivery', '', '0000-00-00', '', 'order', 130.00, 0.00, 0.00, 130.00, 'pending', 30, 'Order has been delivered', '2025-04-29 11:38:13', '2025-04-29 13:29:19', 'uploads/delivery_proofs/1745929045_Background.png', NULL, 0, NULL),
(320, 'RO-20250429-018', 'Van Clive', 'vanngaming2003@gmail.com', '+639749374734', '2025-04-29', '2025-05-06', 'delivery', '', '0000-00-00', 'shipped', 'order', 130.00, 0.00, 0.00, 130.00, 'pending', 30, '', '2025-04-29 12:00:36', '2025-05-03 18:29:24', NULL, NULL, 0, NULL),
(321, 'RO-20250429-019', 'Tuh Targaryen', 'tuhtargaryen@gmail.com', '+639949407497', '2025-04-29', '2025-05-06', 'delivery', '', '0000-00-00', 'cancelled', 'order', 130.00, 0.00, 0.00, 130.00, 'pending', 30, '', '2025-04-29 12:26:34', '2025-04-30 05:33:14', NULL, NULL, 0, NULL),
(322, 'RO-20250429-020', 'Sevence Targaryens', 'sevencetargaryen@gmail.com', '+639837483937', '2025-04-29', '2025-05-06', 'delivery', '', '0000-00-00', 'cancelled', 'order', 130.00, 0.00, 0.00, 130.00, 'pending', 30, '', '2025-04-29 12:30:10', '2025-05-02 14:36:41', NULL, NULL, 0, NULL),
(323, 'RO-20250430-001', 'Siex Targaryen', 'siextargaryen@gmail.com', '+6397463837465', '2025-04-30', '2025-05-07', 'delivery', '', '0000-00-00', 'shipped', 'order', 60.00, 0.00, 0.00, 60.00, 'pending', 30, '', '2025-04-30 04:32:10', '2025-05-03 18:08:55', NULL, NULL, 0, NULL),
(324, 'RO-20250430-002', 'Siex Targaryen', 'siextargaryen@gmail.com', '+6397463837465', '2025-04-30', '0000-00-00', 'pickup', 'Pinana Gourmet Calauan', '2025-05-03', 'completed', 'completed', 50.00, 0.00, 0.00, 50.00, 'paid', 30, 'Order picked up by Siex', '2025-04-30 04:35:16', '2025-05-15 03:54:34', NULL, 'Siex', 1, ''),
(325, 'RO-20250430-003', 'Siex Targaryen', 'siextargaryen@gmail.com', '+6397463837465', '2025-04-30', '2025-05-07', 'delivery', '', '0000-00-00', 'delivered', 'order', 130.00, 0.00, 0.00, 130.00, 'pending', 30, 'Order has been delivered', '2025-04-30 04:35:27', '2025-05-15 07:07:44', 'uploads/delivery_proofs/1747292864_fin-green (1).png', NULL, 0, NULL),
(326, 'RO-20250430-004', 'Siex Targaryen', 'siextargaryen@gmail.com', '+6397463837465', '2025-04-30', '0000-00-00', 'pickup', 'Pinana Gourmet Calauan', '2025-05-03', '', '', 130.00, 0.00, 0.00, 130.00, 'pending', 30, 'Order picked up by Siex', '2025-04-30 04:36:16', '2025-04-30 05:31:54', NULL, 'Siex', 1, ''),
(328, 'RO-20250430-006', 'Siex Targaryen', 'siextargaryen@gmail.com', '+6397463837465', '2025-04-30', '2025-05-07', 'delivery', '', '0000-00-00', 'completed', 'order', 60.00, 0.00, 0.00, 60.00, 'pending', 30, 'Order has been delivered', '2025-04-30 04:52:37', '2025-05-03 14:56:27', 'uploads/delivery_proofs/1745995155_Sign in with Email & Password 2.png', NULL, 0, NULL),
(329, 'RO-20250430-007', 'Siex Targaryen', 'siextargaryen@gmail.com', '+6397463837465', '2025-04-30', '2025-05-07', 'delivery', '', '0000-00-00', 'completed', 'order', 180.00, 0.00, 0.00, 180.00, 'paid', 30, 'Order has been delivered', '2025-04-30 05:01:28', '2025-05-15 03:54:27', 'uploads/delivery_proofs/1746004548_IMG_20250415_084943_922.jpg', NULL, 0, NULL),
(330, 'RO-20250430-008', 'Tuh Targaryen', 'tuhtargaryen@gmail.com', '+639949407497', '2025-04-30', '0000-00-00', 'pickup', 'Pinana Gourmet Calauan', '2025-05-03', 'completed', 'completed', 130.00, 0.00, 0.00, 130.00, 'paid', 30, 'Order picked up by Tuh', '2025-04-30 05:03:00', '2025-05-25 06:32:41', NULL, 'Tuh', 1, ''),
(331, 'RO-20250430-009', 'Tuh Targaryen', 'tuhtargaryen@gmail.com', '+639949407497', '2025-04-30', '0000-00-00', 'pickup', 'Pinana Gourmet Calauan', '2025-05-03', 'completed', 'completed', 20.00, 0.00, 0.00, 20.00, 'paid', 30, 'Order picked up by Tuh', '2025-04-30 05:03:10', '2025-05-04 09:59:52', NULL, 'Tuh', 1, ''),
(332, 'RO-20250430-010', 'Siex Targaryen', 'siextargaryen@gmail.com', '+6397463837465', '2025-04-30', '2025-05-07', 'delivery', '', '0000-00-00', 'completed', 'order', 130.00, 0.00, 0.00, 130.00, 'paid', 30, 'Order has been delivered', '2025-04-30 11:07:42', '2025-05-25 06:32:44', 'uploads/delivery_proofs/1746011338_Header1.png', NULL, 0, NULL),
(333, 'RO-20250430-011', 'Siex Targaryen', 'siextargaryen@gmail.com', '+6397463837465', '2025-04-30', '0000-00-00', 'pickup', 'Pinana Gourmet Calauan', '2025-05-03', 'completed', 'completed', 60.00, 0.00, 0.00, 60.00, 'paid', 30, 'Order picked up by Siex', '2025-04-30 11:26:21', '2025-05-04 07:42:19', NULL, 'Siex', 1, ''),
(334, 'RO-20250430-012', 'Fohr Targaryen', 'fohrtargaryen@gmail.com', '+639495027266', '2025-04-30', '0000-00-00', 'pickup', 'Pinana Gourmet Calauan', '2025-05-03', 'completed', 'completed', 650.00, 0.00, 0.00, 650.00, 'pending', 30, 'Order picked up by Fohr', '2025-04-30 13:26:13', '2025-04-30 13:27:20', NULL, 'Fohr', 1, ''),
(335, 'RO-20250501-001', 'Fyave Targaryen', 'fyavetargaryen@gmail.com', '+639495027266', '2025-05-01', '0000-00-00', 'pickup', 'Pinana Gourmet Calauan', '2025-05-04', 'completed', 'completed', 60.00, 0.00, 0.00, 60.00, 'paid', 15, 'Order picked up by Fyave', '2025-05-01 08:48:19', '2025-05-04 07:29:11', NULL, 'Fyave', 1, ''),
(336, 'RO-20250501-002', 'Fyave Targaryen', 'fyavetargaryen@gmail.com', '+639495027266', '2025-05-01', '2025-05-08', 'delivery', '', '0000-00-00', 'completed', 'order', 130.00, 0.00, 0.00, 130.00, 'paid', 15, 'Order has been delivered', '2025-05-01 08:49:56', '2025-05-25 06:32:37', 'uploads/delivery_proofs/1746089442_IMG_20250414_085806_636.jpg', NULL, 0, NULL),
(337, 'RO-20250501-003', 'Sevence Targaryens', 'sevencetargaryen@gmail.com', '+639837483937', '2025-05-01', '0000-00-00', 'pickup', 'Pinana Gourmet Calauan', '2025-05-04', 'completed', 'completed', 130.00, 0.00, 0.00, 130.00, 'pending', 15, 'Order picked up by Sevence', '2025-05-01 08:51:38', '2025-05-01 08:52:22', NULL, 'Sevence', 1, ''),
(338, 'RO-20250501-004', 'Sevence Targaryens', 'sevencetargaryen@gmail.com', '+639837483937', '2025-05-01', '0000-00-00', 'pickup', 'Pinana Gourmet Calauan', '2025-05-04', 'completed', 'completed', 2600.00, 0.00, 0.00, 2600.00, 'paid', 30, 'Order picked up by Sevence', '2025-05-01 09:28:51', '2025-05-04 07:33:09', NULL, 'Sevence', 1, ''),
(339, 'RO-20250502-001', 'Sevence Targaryens', 'sevencetargaryen@gmail.com', '+639837483937', '2025-05-02', '0000-00-00', 'pickup', 'Pinana Gourmet Calauan', '2025-05-05', 'completed', 'completed', 130.00, 0.00, 0.00, 130.00, 'paid', 30, 'Order picked up by Sevence', '2025-05-02 03:37:22', '2025-05-04 10:09:30', NULL, 'Sevence', 1, ''),
(340, 'RO-20250502-002', 'Pepito Manaloto', 'jamesguevarra070827@gmail.com', '+639283900824', '2025-05-01', '0000-00-00', 'pickup', 'Pinana Gourmet Calauan', '2025-05-01', 'delivered', 'picked up', 1200.00, 0.00, 0.00, 1200.00, 'pending', 15, 'Order picked up by mmmm', '2025-05-02 04:11:09', '2025-05-02 13:34:32', NULL, 'mmmm', 1, ''),
(341, 'RO-20250503-001', 'Siex Targaryen', 'siextargaryen@gmail.com', '+6397463837465', '2025-05-03', '0000-00-00', 'pickup', 'Pinana Gourmet Calauan', '2025-05-06', 'completed', 'completed', 510.00, 0.00, 0.00, 510.00, 'paid', 45, 'Order picked up by Siex', '2025-05-03 16:58:15', '2025-05-05 14:02:57', NULL, 'Siex', 1, ''),
(342, 'RO-20250505-001', 'Eighth Targaryen', 'eighthtargaryen@gmail.com', '+639746573957', '2025-05-05', '0000-00-00', 'pickup', 'Pinana Gourmet Calauan', '2025-05-08', 'ready-to-pickup', 'ready-to-pickup', 510.00, 0.00, 0.00, 510.00, 'pending', 30, '', '2025-05-05 16:24:05', '2025-05-06 18:33:47', NULL, NULL, 0, NULL),
(353, 'RO-20250506-006', 'Siex Targaryen', 'siextargaryen@gmail.com', '+6397463837465', '2025-05-06', '0000-00-00', 'pickup', 'Pinana Gourmet Calauan', '2025-05-09', 'delivered', 'picked up', 180.00, 0.00, 0.00, 180.00, 'pending', 30, 'Order picked up by Siex', '2025-05-06 09:35:13', '2025-05-06 19:00:59', NULL, 'Siex', 1, ''),
(354, 'RO-20250506-007', 'Fohr Targaryen', 'fohrtargaryen@gmail.com', '+639495027266', '2025-05-06', '2025-05-13', 'delivery', '', '0000-00-00', 'shipped', 'order', 130.00, 0.00, 0.00, 130.00, 'pending', 30, '', '2025-05-06 10:49:28', '2025-05-21 12:10:55', NULL, NULL, 0, NULL),
(356, 'RO-20250506-009', 'Sevence Targaryens', 'sevencetargaryen@gmail.com', '+639837483937', '2025-05-06', '2025-05-13', 'delivery', '', '0000-00-00', 'completed', 'order', 390.00, 0.00, 0.00, 390.00, 'paid', 30, 'Order has been delivered', '2025-05-06 18:31:36', '2025-05-15 03:54:44', 'uploads/delivery_proofs/1746556423_mono-green.png', NULL, 0, NULL),
(357, 'RO-20250507-001', 'Fyave Targaryen', 'fyavetargaryen@gmail.com', '639495027266', '2025-05-06', '2025-05-13', 'delivery', '', '0000-00-00', 'completed', 'order', 650.00, 0.00, 0.00, 650.00, 'paid', 30, 'Order has been delivered', '2025-05-06 23:18:05', '2025-06-20 06:31:52', 'uploads/delivery_proofs/1746573564_Sign in with Email & Password 2.png', NULL, 0, NULL),
(358, 'RO-20250528-001', 'Fyave Targaryen', 'fyavetargaryen@gmail.com', '639495027266', '2025-05-28', '2025-05-31', 'delivery', '', '0000-00-00', 'cancelled', 'order', 5200.00, 0.00, 0.00, 5200.00, 'pending', 15, '', '2025-05-28 06:46:10', '2025-06-19 20:48:29', NULL, NULL, 0, NULL),
(359, 'RO-20250620-001', 'Fyave Targaryen', 'fyavetargaryen@gmail.com', '639495027266', '2025-06-20', '2025-06-23', 'delivery', '', '0000-00-00', 'confirmed', 'order', 15000.00, 0.00, 15600.00, 0.00, 'pending', 30, '', '2025-06-20 06:23:09', '2025-06-20 06:27:37', NULL, NULL, 0, NULL);

--
-- Triggers `retailer_orders`
--
DELIMITER $$
CREATE TRIGGER `sync_pickup_status_before_update` BEFORE UPDATE ON `retailer_orders` FOR EACH ROW BEGIN
    -- If delivery_mode is pickup and status changed
    IF NEW.delivery_mode = 'pickup' THEN
        -- Map delivery status to pickup status
        CASE NEW.status
            WHEN 'shipped' THEN
                SET NEW.pickup_status = 'ready for pickup';
            WHEN 'delivered' THEN
                SET NEW.pickup_status = 'picked up';
            ELSE
                SET NEW.pickup_status = NEW.status;
        END CASE;
    END IF;
    
    -- If delivery_mode is pickup and pickup_status changed, update status accordingly
    IF NEW.delivery_mode = 'pickup' THEN
        CASE NEW.pickup_status
            WHEN 'ready for pickup' THEN
                SET NEW.status = 'shipped';
            WHEN 'picked up' THEN
                SET NEW.status = 'delivered';
            ELSE
                SET NEW.status = NEW.pickup_status;
        END CASE;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `retailer_order_deliveries`
--

CREATE TABLE `retailer_order_deliveries` (
  `delivery_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `tracking_number` varchar(50) DEFAULT NULL,
  `carrier` varchar(100) DEFAULT NULL,
  `estimated_arrival` datetime DEFAULT NULL,
  `actual_arrival` datetime DEFAULT NULL,
  `delivery_status` enum('pending','in_transit','out_for_delivery','delivered','failed','delayed') DEFAULT 'pending',
  `recipient_name` varchar(100) DEFAULT NULL,
  `signature_required` tinyint(1) DEFAULT 0,
  `signature_image` varchar(255) DEFAULT NULL,
  `delivery_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `retailer_order_delivery_issues`
--

CREATE TABLE `retailer_order_delivery_issues` (
  `issue_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `issue_type` enum('damaged','missing','wrong','quality','other') NOT NULL,
  `issue_severity` enum('low','medium','high','critical') DEFAULT 'medium',
  `issue_description` text NOT NULL,
  `requested_action` enum('replacement','refund','partial_refund','inspection') NOT NULL,
  `issue_status` enum('reported','under_review','resolved','rejected') DEFAULT 'reported',
  `resolution_notes` text DEFAULT NULL,
  `reported_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `resolved_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `retailer_order_issues`
--

CREATE TABLE `retailer_order_issues` (
  `issue_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `issue_type` varchar(50) NOT NULL,
  `severity` varchar(20) NOT NULL DEFAULT 'medium',
  `description` text NOT NULL,
  `requested_action` varchar(50) NOT NULL,
  `resolution` text DEFAULT NULL,
  `resolved_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `retailer_order_items`
--

CREATE TABLE `retailer_order_items` (
  `item_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` varchar(50) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `product_name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `retailer_order_items`
--

INSERT INTO `retailer_order_items` (`item_id`, `order_id`, `product_id`, `quantity`, `unit_price`, `total_price`, `created_at`, `product_name`) VALUES
(276, 286, 'P031', 1, 180.00, 180.00, '2025-04-28 12:46:50', 'Piña Tuyo'),
(283, 293, 'P033', 12, 130.00, 1560.00, '2025-04-28 15:55:10', 'Pineapple Concentrate'),
(292, 302, 'P039', 1, 20.00, 20.00, '2025-04-29 04:23:44', 'Sponge'),
(295, 305, 'P033', 1, 130.00, 130.00, '2025-04-29 05:54:48', 'Pineapple Concentrate'),
(296, 306, 'P033', 1, 130.00, 130.00, '2025-04-29 05:54:59', 'Pineapple Concentrate'),
(297, 307, 'P039', 1, 20.00, 20.00, '2025-04-29 06:22:13', 'Sponge'),
(298, 308, 'P029', 1, 130.00, 130.00, '2025-04-29 06:34:01', 'Piña Bars'),
(299, 309, 'P039', 1, 20.00, 20.00, '2025-04-29 07:08:29', 'Sponge'),
(300, 310, 'P033', 1, 130.00, 130.00, '2025-04-29 07:37:06', 'Pineapple Concentrate'),
(302, 312, 'P033', 1, 130.00, 130.00, '2025-04-29 08:50:15', 'Pineapple Concentrate'),
(303, 313, 'P033', 1, 130.00, 130.00, '2025-04-29 09:30:24', 'Pineapple Concentrate'),
(304, 314, 'P036', 1, 130.00, 130.00, '2025-04-29 10:00:03', 'Piña Tsokolate Bars'),
(305, 315, 'P033', 1, 130.00, 130.00, '2025-04-29 10:02:21', 'Pineapple Concentrate'),
(306, 316, 'P036', 1, 130.00, 130.00, '2025-04-29 10:14:18', 'Piña Tsokolate Bars'),
(307, 317, 'P036', 1, 130.00, 130.00, '2025-04-29 10:50:35', 'Piña Tsokolate Bars'),
(308, 318, 'P031', 1, 180.00, 180.00, '2025-04-29 10:59:18', 'Piña Tuyo'),
(309, 319, 'P033', 1, 130.00, 130.00, '2025-04-29 11:38:13', 'Pineapple Concentrate'),
(310, 320, 'P036', 1, 130.00, 130.00, '2025-04-29 12:00:36', 'Piña Tsokolate Bars'),
(311, 321, 'P033', 1, 130.00, 130.00, '2025-04-29 12:26:34', 'Pineapple Concentrate'),
(312, 322, 'P033', 1, 130.00, 130.00, '2025-04-29 12:30:10', 'Pineapple Concentrate'),
(313, 323, 'P034', 1, 60.00, 60.00, '2025-04-30 04:32:10', 'Piña Dishwashing Soap'),
(314, 324, 'P030', 1, 50.00, 50.00, '2025-04-30 04:35:16', 'Piña Putoseko'),
(315, 325, 'P033', 1, 130.00, 130.00, '2025-04-30 04:35:27', 'Pineapple Concentrate'),
(316, 326, 'P033', 1, 130.00, 130.00, '2025-04-30 04:36:16', 'Pineapple Concentrate'),
(318, 328, 'P034', 1, 60.00, 60.00, '2025-04-30 04:52:37', 'Piña Dishwashing Soap'),
(319, 329, 'P031', 1, 180.00, 180.00, '2025-04-30 05:01:28', 'Piña Tuyo'),
(320, 330, 'P033', 1, 130.00, 130.00, '2025-04-30 05:03:00', 'Pineapple Concentrate'),
(321, 331, 'P039', 1, 20.00, 20.00, '2025-04-30 05:03:10', 'Sponge'),
(322, 332, 'P036', 1, 130.00, 130.00, '2025-04-30 11:07:42', 'Piña Tsokolate Bars'),
(323, 333, 'P038', 1, 60.00, 60.00, '2025-04-30 11:26:21', 'Macha Latte'),
(324, 334, 'P036', 2, 130.00, 260.00, '2025-04-30 13:26:13', 'Piña Tsokolate Bars'),
(325, 334, 'P033', 3, 130.00, 390.00, '2025-04-30 13:26:13', 'Pineapple Concentrate'),
(326, 335, 'P034', 1, 60.00, 60.00, '2025-05-01 08:48:19', 'Piña Dishwashing Soap'),
(327, 336, 'P035', 1, 130.00, 130.00, '2025-05-01 08:49:56', 'Piña Mangga Bars'),
(328, 337, 'P035', 1, 130.00, 130.00, '2025-05-01 08:51:38', 'Piña Mangga Bars'),
(329, 338, 'P036', 20, 130.00, 2600.00, '2025-05-01 09:28:51', 'Piña Tsokolate Bars'),
(330, 339, 'P035', 1, 130.00, 130.00, '2025-05-02 03:37:23', 'Piña Mangga Bars'),
(331, 340, 'P038', 20, 60.00, 1200.00, '2025-05-02 04:11:09', 'Macha Latte'),
(332, 341, 'P033', 3, 130.00, 390.00, '2025-05-03 16:58:15', 'Pineapple Concentrate'),
(333, 341, 'P034', 2, 60.00, 120.00, '2025-05-03 16:58:15', 'Piña Dishwashing Soap'),
(334, 342, 'P032', 2, 180.00, 360.00, '2025-05-05 16:24:05', 'TinaPiña'),
(335, 342, 'P030', 3, 50.00, 150.00, '2025-05-05 16:24:05', 'Piña Putoseko'),
(347, 353, 'P032', 1, 180.00, 180.00, '2025-05-06 09:35:13', 'TinaPiña'),
(348, 354, 'P036', 1, 130.00, 130.00, '2025-05-06 10:49:28', 'Piña Tsokolate Bars'),
(350, 356, 'P033', 2, 130.00, 260.00, '2025-05-06 18:31:36', 'Pineapple Concentrate'),
(351, 356, 'P033', 1, 130.00, 130.00, '2025-05-06 18:31:36', 'Pineapple Concentrate'),
(352, 357, 'P036', 5, 130.00, 650.00, '2025-05-06 23:18:05', 'Piña Tsokolate Bars'),
(353, 358, 'P029', 40, 130.00, 5200.00, '2025-05-28 06:46:10', 'Piña Bars'),
(354, 359, 'P029', 30, 130.00, 3900.00, '2025-06-20 06:23:09', 'Piña Bars'),
(355, 359, 'P034', 30, 60.00, 1800.00, '2025-06-20 06:23:09', 'Piña Dishwashing Soap'),
(356, 359, 'P035', 30, 130.00, 3900.00, '2025-06-20 06:23:09', 'Piña Mangga Bars'),
(357, 359, 'P030', 30, 50.00, 1500.00, '2025-06-20 06:23:09', 'Piña Putoseko'),
(358, 359, 'P036', 30, 130.00, 3900.00, '2025-06-20 06:23:09', 'Piña Tsokolate Bars');

-- --------------------------------------------------------

--
-- Table structure for table `retailer_order_item_payments`
--

CREATE TABLE `retailer_order_item_payments` (
  `item_payment_id` int(11) NOT NULL,
  `payment_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `product_id` varchar(50) DEFAULT NULL,
  `quantity_paid` int(11) NOT NULL,
  `quantity_unsold` int(11) DEFAULT 0,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `retailer_order_item_payments`
--

INSERT INTO `retailer_order_item_payments` (`item_payment_id`, `payment_id`, `item_id`, `product_id`, `quantity_paid`, `quantity_unsold`, `created_at`) VALUES
(1, 34, 321, 'P039', 1, 0, '2025-05-03 23:45:34'),
(2, 36, 329, 'P036', 15, 0, '2025-05-04 00:07:35'),
(3, 37, 319, 'P031', 1, 0, '2025-05-04 00:45:29'),
(4, 38, 332, 'P033', 2, 0, '2025-05-04 00:59:30'),
(5, 38, 333, 'P034', 1, 0, '2025-05-04 00:59:30'),
(6, 39, 332, 'P033', 2, 0, '2025-05-04 01:26:27'),
(7, 39, 333, 'P034', 1, 0, '2025-05-04 01:26:27'),
(8, 40, 326, 'P034', 1, 0, '2025-05-04 02:17:33'),
(9, 41, 283, 'P033', 6, 6, '2025-05-05 17:03:40'),
(10, 42, 320, 'P033', 1, 0, '2025-05-06 19:02:25'),
(11, 43, 308, 'P031', 1, 0, '2025-05-06 19:03:45'),
(12, 44, 351, 'P033', 1, 1, '2025-05-07 02:38:02'),
(13, 44, 351, 'P033', 1, 0, '2025-05-07 02:38:02'),
(14, 45, 327, 'P035', 1, 0, '2025-05-07 06:52:56'),
(15, 46, 276, 'P031', 1, 0, '2025-05-07 07:00:01'),
(16, 47, 352, 'P036', 5, 0, '2025-06-20 14:30:42');

-- --------------------------------------------------------

--
-- Table structure for table `retailer_order_item_verification`
--

CREATE TABLE `retailer_order_item_verification` (
  `verification_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `verified` tinyint(1) DEFAULT 0,
  `verified_quantity` int(11) DEFAULT 0,
  `notes` text DEFAULT NULL,
  `verified_by` int(11) DEFAULT NULL,
  `verified_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `retailer_order_item_verification`
--

INSERT INTO `retailer_order_item_verification` (`verification_id`, `order_id`, `item_id`, `verified`, `verified_quantity`, `notes`, `verified_by`, `verified_at`) VALUES
(1, 310, 300, 1, 1, NULL, 0, '2025-04-29 08:28:13'),
(2, 315, 305, 1, 1, NULL, 0, '2025-04-29 11:22:55'),
(3, 319, 309, 1, 1, NULL, 0, '2025-04-29 13:29:19'),
(4, 330, 320, 1, 1, NULL, 0, '2025-04-30 05:29:01'),
(5, 326, 316, 1, 1, NULL, 0, '2025-04-30 05:31:54'),
(6, 293, 283, 1, 12, NULL, 0, '2025-04-30 05:37:56'),
(7, 328, 318, 1, 1, NULL, 0, '2025-04-30 06:40:10'),
(8, 331, 321, 1, 1, NULL, 0, '2025-04-30 06:42:54'),
(9, 324, 314, 1, 1, NULL, 0, '2025-04-30 07:20:22'),
(10, 302, 292, 1, 1, NULL, 0, '2025-04-30 08:39:39');

-- --------------------------------------------------------

--
-- Table structure for table `retailer_order_payments`
--

CREATE TABLE `retailer_order_payments` (
  `payment_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `payment_amount` decimal(10,2) NOT NULL,
  `payment_reference` varchar(100) DEFAULT NULL,
  `payment_notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `retailer_order_payments`
--

INSERT INTO `retailer_order_payments` (`payment_id`, `order_id`, `payment_method`, `payment_amount`, `payment_reference`, `payment_notes`, `created_at`) VALUES
(1, 330, 'cash', 130.00, 'CASH-20250503142430', '', '2025-05-03 20:24:30'),
(2, 330, 'mobile', 130.00, '38384932', 'Mobile payment', '2025-05-03 20:24:40'),
(3, 330, 'mobile', 130.00, '53872', 'Mobile payment', '2025-05-03 20:24:45'),
(4, 331, 'mobile', 20.00, '435', 'Mobile payment', '2025-05-03 20:25:02'),
(5, 331, 'cash', 20.00, 'CASH-20250503142616', '', '2025-05-03 20:26:16'),
(6, 331, 'cash', 20.00, 'CASH-20250503142616', '', '2025-05-03 20:26:16'),
(7, 330, 'cash', 130.00, 'CASH-20250503142814', '', '2025-05-03 20:28:14'),
(8, 333, 'cash', 60.00, 'CASH-20250503143008', '', '2025-05-03 20:30:08'),
(9, 333, 'mobile', 60.00, '3535532', 'Mobile payment', '2025-05-03 20:30:18'),
(10, 336, 'cash', 130.00, 'CASH-20250503160255', '', '2025-05-03 22:02:55'),
(11, 336, 'cash', 60.00, 'CASH-20250503160301', '', '2025-05-03 22:03:01'),
(12, 330, 'cash', 20.00, 'CASH-20250503160335', '', '2025-05-03 22:03:35'),
(13, 331, 'cash', 20.00, 'CASH-20250503160455', '', '2025-05-03 22:04:55'),
(14, 331, 'cash', 20.00, 'CASH-20250503160520', '', '2025-05-03 22:05:20'),
(15, 335, 'cash', 60.00, 'CASH-20250503160826', '', '2025-05-03 22:08:26'),
(16, 293, 'mobile', 180.00, '12345678910', 'Mobile payment', '2025-05-03 22:34:09'),
(18, 332, 'mobile', 130.00, '69', 'Mobile payment', '2025-05-03 22:35:43'),
(28, 333, 'cash', 130.00, 'CASH-20250503173232', '', '2025-05-03 23:32:32'),
(29, 333, 'cash', 130.00, 'CASH-20250503173237', '', '2025-05-03 23:32:37'),
(30, 333, 'cash', 130.00, 'CASH-20250503173237', '', '2025-05-03 23:32:37'),
(31, 333, 'cash', 130.00, 'CASH-20250503173237', '', '2025-05-03 23:32:37'),
(32, 332, 'cash', 130.00, 'CASH-20250503173258', '', '2025-05-03 23:32:58'),
(33, 332, 'cash', 130.00, 'CASH-20250503173258', '', '2025-05-03 23:32:58'),
(34, 331, 'cash', 20.00, 'CASH-20250503174534', '', '2025-05-03 23:45:34'),
(35, 339, 'cash', 1950.00, 'CASH-20250503180703', '', '2025-05-04 00:07:03'),
(36, 338, 'cash', 1950.00, 'CASH-20250503180735', '', '2025-05-04 00:07:35'),
(37, 329, 'cash', 180.00, 'CASH-20250503184529', 'test', '2025-05-04 00:45:29'),
(38, 341, 'cash', 320.00, 'CASH-20250503185930', '', '2025-05-04 00:59:30'),
(39, 341, 'cash', 320.00, 'CASH-20250503192627', '', '2025-05-04 01:26:27'),
(40, 335, 'mobile', 60.00, '74821749812', '', '2025-05-04 02:17:33'),
(41, 293, 'cash', 780.00, 'CASH-20250505110340', '', '2025-05-05 17:03:40'),
(42, 330, 'cash', 130.00, 'CASH-20250506130225', '', '2025-05-06 19:02:25'),
(43, 318, 'cash', 180.00, 'CASH-20250506130345', '', '2025-05-06 19:03:45'),
(44, 356, 'cash', 260.00, 'CASH-20250506203802', '', '2025-05-07 02:38:02'),
(45, 336, 'cash', 130.00, 'CASH-20250507005256', '', '2025-05-07 06:52:56'),
(46, 286, 'cash', 180.00, 'CASH-20250507010001', '', '2025-05-07 07:00:01'),
(47, 357, 'mobile', 650.00, '121', '', '2025-06-20 14:30:42');

-- --------------------------------------------------------

--
-- Table structure for table `retailer_order_returns`
--

CREATE TABLE `retailer_order_returns` (
  `return_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `return_reason` varchar(255) NOT NULL,
  `return_details` text DEFAULT NULL,
  `return_status` enum('requested','approved','rejected','completed') DEFAULT 'requested',
  `requested_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `processed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `retailer_order_returns`
--

INSERT INTO `retailer_order_returns` (`return_id`, `order_id`, `return_reason`, `return_details`, `return_status`, `requested_at`, `processed_at`) VALUES
(1, 308, 'Other', '', 'requested', '2025-04-29 08:29:20', NULL),
(2, 316, 'Expired', '', 'requested', '2025-04-29 11:23:51', NULL),
(3, 318, 'Quality Issues', '', 'requested', '2025-04-29 11:31:17', NULL),
(4, 307, 'Wrong Items', 'tgj5h', 'requested', '2025-05-02 03:40:42', NULL),
(5, 340, 'Damaged', '', 'requested', '2025-05-02 04:16:17', NULL),
(6, 305, 'Quality Issues', '', 'requested', '2025-05-05 11:19:34', NULL),
(7, 356, 'Quality Issues', '', 'requested', '2025-05-06 18:34:20', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `retailer_order_return_items`
--

CREATE TABLE `retailer_order_return_items` (
  `return_item_id` int(11) NOT NULL,
  `return_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `return_quantity` int(11) NOT NULL,
  `return_reason` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `retailer_order_return_items`
--

INSERT INTO `retailer_order_return_items` (`return_item_id`, `return_id`, `item_id`, `return_quantity`, `return_reason`) VALUES
(1, 1, 298, 1, 'Quality Issue'),
(2, 2, 306, 1, 'Quality Issue'),
(3, 3, 308, 1, 'Damaged'),
(4, 4, 297, 1, 'Wrong Item'),
(5, 5, 331, 20, 'Damaged'),
(6, 6, 295, 1, 'Quality Issue'),
(7, 7, 350, 1, 'Quality Issue');

-- --------------------------------------------------------

--
-- Table structure for table `retailer_order_status_history`
--

CREATE TABLE `retailer_order_status_history` (
  `history_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `status` enum('order','confirmed','shipped','delivered','cancelled','ready-to-pickup','picked up','completed','return_requested','returned') NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `delivery_hours` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `retailer_order_status_history`
--

INSERT INTO `retailer_order_status_history` (`history_id`, `order_id`, `status`, `notes`, `created_at`, `delivery_hours`) VALUES
(587, 286, 'order', 'Order created', '2025-04-28 12:46:50', NULL),
(588, 286, 'confirmed', 'Order confirmed by admin', '2025-04-28 12:46:56', NULL),
(594, 286, 'ready-to-pickup', 'Order is ready for pickup', '2025-04-28 14:07:20', NULL),
(605, 293, 'order', 'Order created', '2025-04-28 15:55:10', NULL),
(606, 293, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-28 16:20:38', NULL),
(607, 293, 'shipped', 'Order has been shipped. Delivery: Evening (6-8 pm)', '2025-04-28 16:21:03', 'Evening (6-8 pm)'),
(608, 286, 'picked up', 'Order has been picked up', '2025-04-28 17:36:30', NULL),
(611, 293, 'delivered', 'Order has been delivered', '2025-04-28 17:45:29', NULL),
(653, 302, 'order', 'Order created', '2025-04-29 04:23:44', NULL),
(656, 302, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-29 05:17:36', NULL),
(657, 302, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-04-29 05:17:45', 'Morning (7-12 am)'),
(658, 302, 'delivered', 'Order has been delivered', '2025-04-29 05:18:04', NULL),
(659, 305, 'order', 'Order created', '2025-04-29 05:54:48', NULL),
(660, 306, 'order', 'Order created', '2025-04-29 05:54:59', NULL),
(661, 306, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-29 05:55:14', NULL),
(662, 306, 'ready-to-pickup', 'Order is ready for pickup', '2025-04-29 05:55:19', NULL),
(663, 306, 'picked up', 'Order picked up by Fyave', '2025-04-29 05:55:25', NULL),
(664, 307, 'order', 'Order created', '2025-04-29 06:22:13', NULL),
(665, 308, 'order', 'Order created', '2025-04-29 06:34:01', NULL),
(666, 308, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-29 06:34:11', NULL),
(667, 308, 'ready-to-pickup', 'Order is ready for pickup', '2025-04-29 06:34:17', NULL),
(668, 308, 'picked up', 'Order picked up by Van', '2025-04-29 06:34:28', NULL),
(669, 309, 'order', 'Order created', '2025-04-29 07:08:29', NULL),
(670, 309, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-29 07:08:41', NULL),
(671, 309, 'ready-to-pickup', 'Order is ready for pickup', '2025-04-29 07:08:46', NULL),
(672, 309, 'picked up', 'Order picked up by Siex', '2025-04-29 07:09:00', NULL),
(673, 310, 'order', 'Order created', '2025-04-29 07:37:06', NULL),
(674, 310, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-29 07:37:27', NULL),
(675, 310, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-04-29 07:37:33', 'Morning (7-12 am)'),
(676, 310, 'delivered', 'Order has been delivered', '2025-04-29 07:37:44', NULL),
(678, 310, 'completed', 'Order verified and completed by retailer', '2025-04-29 08:28:13', NULL),
(679, 308, 'return_requested', 'Return requested: Other', '2025-04-29 08:29:20', NULL),
(680, 312, 'order', 'Order created', '2025-04-29 08:50:15', NULL),
(681, 312, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-29 08:51:08', NULL),
(682, 312, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-04-29 08:51:14', 'Morning (7-12 am)'),
(683, 312, 'delivered', 'Order has been delivered', '2025-04-29 08:51:33', NULL),
(684, 313, 'order', 'Order created', '2025-04-29 09:30:24', NULL),
(685, 313, 'cancelled', 'Order cancelled by user', '2025-04-29 09:51:00', NULL),
(686, 313, 'order', 'Order placed again from cancelled order', '2025-04-29 09:51:04', NULL),
(687, 313, 'cancelled', 'Order cancelled by user', '2025-04-29 09:51:14', NULL),
(688, 314, 'order', 'Order created', '2025-04-29 10:00:03', NULL),
(689, 307, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-29 10:00:29', NULL),
(690, 307, 'ready-to-pickup', 'Order is ready for pickup', '2025-04-29 10:00:36', NULL),
(691, 307, 'picked up', 'Order picked up by Sevence', '2025-04-29 10:00:53', NULL),
(692, 315, 'order', 'Order created', '2025-04-29 10:02:21', NULL),
(693, 315, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-29 10:02:52', NULL),
(694, 315, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-04-29 10:02:58', 'Morning (7-12 am)'),
(695, 315, 'delivered', 'Order has been delivered', '2025-04-29 10:03:03', NULL),
(696, 307, 'confirmed', 'Order confirmed by admin', '2025-04-29 10:05:42', NULL),
(697, 307, 'confirmed', 'Order confirmed by admin', '2025-04-29 10:05:42', NULL),
(698, 307, 'ready-to-pickup', 'Order is ready for pickup', '2025-04-29 10:05:50', NULL),
(699, 316, 'order', 'Order created', '2025-04-29 10:14:18', NULL),
(700, 316, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-29 10:14:49', NULL),
(701, 316, 'ready-to-pickup', 'Order is ready for pickup', '2025-04-29 10:14:54', NULL),
(702, 316, 'picked up', 'Order picked up by Van', '2025-04-29 10:14:59', NULL),
(703, 317, 'order', 'Order created', '2025-04-29 10:50:35', NULL),
(704, 318, 'order', 'Order created', '2025-04-29 10:59:18', NULL),
(705, 315, 'completed', 'Order verified and completed by retailer', '2025-04-29 11:22:55', NULL),
(706, 316, 'return_requested', 'Return requested: Expired', '2025-04-29 11:23:51', NULL),
(707, 318, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-29 11:30:28', NULL),
(708, 318, 'ready-to-pickup', 'Order is ready for pickup', '2025-04-29 11:30:32', NULL),
(709, 318, 'picked up', 'Order picked up by Tuh', '2025-04-29 11:30:54', NULL),
(710, 318, 'return_requested', 'Return requested: Quality Issues', '2025-04-29 11:31:17', NULL),
(711, 319, 'order', 'Order created', '2025-04-29 11:38:13', NULL),
(712, 320, 'order', 'Order created', '2025-04-29 12:00:36', NULL),
(713, 319, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-29 12:17:10', NULL),
(714, 319, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-04-29 12:17:16', 'Morning (7-12 am)'),
(715, 319, 'delivered', 'Order has been delivered', '2025-04-29 12:17:25', NULL),
(716, 321, 'order', 'Order created', '2025-04-29 12:26:34', NULL),
(717, 322, 'order', 'Order created', '2025-04-29 12:30:10', NULL),
(718, 321, 'cancelled', 'Order cancelled by retailer', '2025-04-29 13:06:23', NULL),
(719, 321, 'order', 'Order placed again from cancelled order', '2025-04-29 13:06:27', NULL),
(720, 321, 'cancelled', 'Order cancelled by retailer', '2025-04-29 13:06:30', NULL),
(721, 313, 'order', 'Order placed again from cancelled order', '2025-04-29 13:15:20', NULL),
(722, 319, 'completed', 'Order verified and completed by retailer', '2025-04-29 13:29:19', NULL),
(723, 321, 'order', 'Order placed again from cancelled order', '2025-04-29 13:29:26', NULL),
(724, 321, 'cancelled', 'Order cancelled by retailer', '2025-04-29 13:29:29', NULL),
(725, 321, 'order', 'Order placed again from cancelled order', '2025-04-29 13:52:31', NULL),
(726, 321, 'cancelled', 'Order cancelled by retailer', '2025-04-29 13:52:34', NULL),
(727, 313, 'cancelled', 'Order cancelled by retailer', '2025-04-29 14:31:08', NULL),
(728, 313, 'order', 'Order placed again from cancelled order', '2025-04-29 14:31:17', NULL),
(729, 321, 'order', 'Order placed again from cancelled order', '2025-04-29 14:47:25', NULL),
(730, 321, 'cancelled', 'Order cancelled by retailer', '2025-04-29 14:47:29', NULL),
(731, 321, 'order', 'Order placed again from cancelled order', '2025-04-29 14:56:28', NULL),
(732, 321, 'cancelled', 'Order cancelled by retailer', '2025-04-29 14:56:32', NULL),
(733, 313, 'cancelled', 'Order cancelled by retailer', '2025-04-29 15:03:12', NULL),
(734, 313, 'order', 'Order placed again from cancelled order', '2025-04-29 15:03:20', NULL),
(735, 323, 'order', 'Order created', '2025-04-30 04:32:10', NULL),
(736, 313, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-30 04:32:20', NULL),
(737, 323, 'cancelled', 'Order cancelled by retailer', '2025-04-30 04:34:15', NULL),
(738, 323, 'order', 'Order placed again from cancelled order', '2025-04-30 04:34:31', NULL),
(739, 323, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-30 04:34:49', NULL),
(740, 324, 'order', 'Order created', '2025-04-30 04:35:16', NULL),
(741, 325, 'order', 'Order created', '2025-04-30 04:35:27', NULL),
(742, 325, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-30 04:35:40', NULL),
(743, 325, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-04-30 04:35:50', 'Morning (7-12 am)'),
(744, 326, 'order', 'Order created', '2025-04-30 04:36:16', NULL),
(745, 324, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-30 04:36:27', NULL),
(746, 324, 'ready-to-pickup', 'Order is ready for pickup', '2025-04-30 04:36:36', NULL),
(748, 326, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-30 04:37:24', NULL),
(749, 326, 'ready-to-pickup', 'Order is ready for pickup', '2025-04-30 04:37:30', NULL),
(750, 326, 'picked up', 'Order picked up by Siex', '2025-04-30 04:37:40', NULL),
(751, 328, 'order', 'Order created', '2025-04-30 04:52:37', NULL),
(753, 329, 'order', 'Order created', '2025-04-30 05:01:28', NULL),
(754, 328, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-30 05:01:50', NULL),
(755, 330, 'order', 'Order created', '2025-04-30 05:03:00', NULL),
(756, 331, 'order', 'Order created', '2025-04-30 05:03:10', NULL),
(757, 330, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-30 05:03:37', NULL),
(758, 330, 'ready-to-pickup', 'Order is ready for pickup', '2025-04-30 05:03:47', NULL),
(759, 330, 'picked up', 'Order picked up by Tuh', '2025-04-30 05:06:05', NULL),
(760, 330, 'completed', 'Order verified and completed by retailer', '2025-04-30 05:29:01', NULL),
(761, 326, 'completed', 'Order verified and completed by retailer', '2025-04-30 05:31:54', NULL),
(762, 321, 'order', 'Order placed again from cancelled order', '2025-04-30 05:33:07', NULL),
(763, 321, 'cancelled', 'Order cancelled by retailer', '2025-04-30 05:33:14', NULL),
(764, 331, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-30 05:34:40', NULL),
(765, 331, 'ready-to-pickup', 'Order is ready for pickup', '2025-04-30 05:34:45', NULL),
(766, 331, 'picked up', 'Order picked up by Tuh', '2025-04-30 05:35:01', NULL),
(767, 293, 'completed', 'Order verified and completed by retailer', '2025-04-30 05:37:56', NULL),
(768, 328, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-04-30 06:38:57', 'Morning (7-12 am)'),
(769, 328, 'delivered', 'Order has been delivered', '2025-04-30 06:39:15', NULL),
(770, 328, 'completed', 'Order verified and completed by retailer', '2025-04-30 06:40:10', NULL),
(771, 331, 'completed', 'Order verified and completed by retailer', '2025-04-30 06:42:54', NULL),
(772, 324, 'picked up', 'Order picked up by Siex', '2025-04-30 07:20:13', NULL),
(773, 324, 'completed', 'Order verified and completed by retailer', '2025-04-30 07:20:22', NULL),
(776, 302, 'completed', 'Order verified and completed by retailer', '2025-04-30 08:39:39', NULL),
(777, 329, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-30 09:15:15', NULL),
(778, 329, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-04-30 09:15:32', 'Morning (7-12 am)'),
(779, 329, 'delivered', 'Order has been delivered', '2025-04-30 09:15:48', NULL),
(788, 329, 'completed', 'Order completed and inventory updated', '2025-04-30 09:22:33', NULL),
(789, 332, 'order', 'Order created', '2025-04-30 11:07:42', NULL),
(790, 332, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-30 11:08:37', NULL),
(791, 332, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-04-30 11:08:46', 'Morning (7-12 am)'),
(792, 332, 'delivered', 'Order has been delivered', '2025-04-30 11:08:58', NULL),
(793, 332, 'completed', 'Order completed and inventory updated', '2025-04-30 11:10:13', NULL),
(794, 333, 'order', 'Order created', '2025-04-30 11:26:21', NULL),
(795, 333, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-30 11:27:00', NULL),
(796, 333, 'ready-to-pickup', 'Order is ready for pickup', '2025-04-30 11:27:20', NULL),
(797, 333, 'picked up', 'Order picked up by Siex', '2025-04-30 11:27:38', NULL),
(798, 333, 'completed', 'Order completed and inventory updated', '2025-04-30 11:28:45', NULL),
(799, 314, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-30 12:02:25', NULL),
(800, 314, 'ready-to-pickup', 'Order is ready for pickup', '2025-04-30 12:02:33', NULL),
(801, 314, 'picked up', 'Order picked up by Sevence', '2025-04-30 12:02:42', NULL),
(802, 314, 'completed', 'Order completed and inventory updated', '2025-04-30 12:03:11', NULL),
(803, 312, 'completed', 'Order completed and inventory updated', '2025-04-30 13:24:10', NULL),
(804, 334, 'order', 'Order created', '2025-04-30 13:26:13', NULL),
(805, 334, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-04-30 13:26:43', NULL),
(806, 334, 'ready-to-pickup', 'Order is ready for pickup', '2025-04-30 13:26:55', NULL),
(807, 334, 'picked up', 'Order picked up by Fohr', '2025-04-30 13:27:06', NULL),
(808, 334, 'completed', 'Order completed and inventory updated', '2025-04-30 13:27:20', NULL),
(809, 286, 'completed', 'Order completed and inventory updated', '2025-05-01 08:47:23', NULL),
(810, 335, 'order', 'Order created', '2025-05-01 08:48:19', NULL),
(811, 335, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-05-01 08:48:32', NULL),
(812, 335, 'ready-to-pickup', 'Order is ready for pickup', '2025-05-01 08:48:40', NULL),
(813, 335, 'picked up', 'Order picked up by Fyave', '2025-05-01 08:48:46', NULL),
(814, 335, 'completed', 'Order completed and inventory updated', '2025-05-01 08:49:02', NULL),
(815, 336, 'order', 'Order created', '2025-05-01 08:49:56', NULL),
(816, 336, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-05-01 08:50:06', NULL),
(817, 305, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-05-01 08:50:11', NULL),
(818, 336, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-05-01 08:50:30', 'Morning (7-12 am)'),
(819, 336, 'delivered', 'Order has been delivered', '2025-05-01 08:50:42', NULL),
(820, 336, 'completed', 'Order completed and inventory updated', '2025-05-01 08:50:55', NULL),
(821, 337, 'order', 'Order created', '2025-05-01 08:51:38', NULL),
(822, 337, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-05-01 08:51:52', NULL),
(823, 337, 'ready-to-pickup', 'Order is ready for pickup', '2025-05-01 08:52:03', NULL),
(824, 337, 'picked up', 'Order picked up by Sevence', '2025-05-01 08:52:11', NULL),
(825, 337, 'completed', 'Order completed and inventory updated', '2025-05-01 08:52:22', NULL),
(826, 306, 'completed', 'Order completed and inventory updated', '2025-05-01 08:55:14', NULL),
(827, 338, 'order', 'Order created', '2025-05-01 09:28:51', NULL),
(828, 338, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-05-01 09:29:13', NULL),
(829, 338, 'ready-to-pickup', 'Order is ready for pickup', '2025-05-01 09:29:23', NULL),
(830, 338, 'picked up', 'Order picked up by Sevence', '2025-05-01 09:29:30', NULL),
(831, 338, 'completed', 'Order completed and inventory updated', '2025-05-01 09:29:46', NULL),
(832, 317, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-05-01 09:35:17', NULL),
(833, 317, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-05-01 09:35:27', 'Morning (7-12 am)'),
(834, 317, 'delivered', 'Order has been delivered', '2025-05-01 09:35:34', NULL),
(835, 317, 'completed', 'Order completed and inventory updated', '2025-05-01 09:35:51', NULL),
(836, 339, 'order', 'Order created', '2025-05-02 03:37:23', NULL),
(837, 339, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-05-02 03:37:39', NULL),
(838, 339, 'ready-to-pickup', 'Order is ready for pickup', '2025-05-02 03:37:56', NULL),
(839, 339, 'picked up', 'Order picked up by Sevence', '2025-05-02 03:38:23', NULL),
(840, 339, 'completed', 'Order completed and inventory updated', '2025-05-02 03:38:45', NULL),
(841, 307, 'picked up', 'Order picked up by Sevence', '2025-05-02 03:39:57', NULL),
(842, 307, 'return_requested', 'Return requested: Wrong Items', '2025-05-02 03:40:42', NULL),
(843, 340, 'order', 'Order created', '2025-05-02 04:11:09', NULL),
(844, 340, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-05-02 04:12:53', NULL),
(845, 340, 'ready-to-pickup', 'Order is ready for pickup', '2025-05-02 04:13:39', NULL),
(846, 340, 'picked up', 'Order picked up by mmmm', '2025-05-02 04:15:29', NULL),
(847, 340, 'return_requested', 'Return requested: Damaged', '2025-05-02 04:16:17', NULL),
(848, 340, 'picked up', 'Return request resolved: bb', '2025-05-02 13:34:32', NULL),
(849, 307, 'picked up', 'Return request resolved: bb', '2025-05-02 13:36:25', NULL),
(850, 307, 'completed', 'Order completed and inventory updated', '2025-05-02 14:23:05', NULL),
(851, 322, 'cancelled', 'Order cancelled by retailer', '2025-05-02 14:36:41', NULL),
(852, 320, 'confirmed', 'Order has been confirmed', '2025-05-02 15:45:49', NULL),
(853, 318, 'picked up', 'Return request resolved: rhrey', '2025-05-02 16:33:04', NULL),
(854, 330, '', 'Payment processed via Cash. Amount: ₱130.00. Reference: CASH-20250503142430', '2025-05-03 12:24:30', NULL),
(855, 330, '', 'Payment processed via Mobile. Amount: ₱130.00. Reference: 38384932', '2025-05-03 12:24:40', NULL),
(856, 330, '', 'Payment processed via Mobile. Amount: ₱130.00. Reference: 53872', '2025-05-03 12:24:45', NULL),
(857, 331, '', 'Payment processed via Mobile. Amount: ₱20.00. Reference: 435', '2025-05-03 12:25:02', NULL),
(858, 331, '', 'Payment processed via Cash. Amount: ₱20.00. Reference: CASH-20250503142616', '2025-05-03 12:26:16', NULL),
(859, 331, '', 'Payment processed via Cash. Amount: ₱20.00. Reference: CASH-20250503142616', '2025-05-03 12:26:16', NULL),
(860, 330, '', 'Payment processed via Cash. Amount: ₱130.00. Reference: CASH-20250503142814', '2025-05-03 12:28:14', NULL),
(861, 333, '', 'Payment processed via Cash. Amount: ₱60.00. Reference: CASH-20250503143008', '2025-05-03 12:30:08', NULL),
(862, 333, '', 'Payment processed via Mobile. Amount: ₱60.00. Reference: 3535532', '2025-05-03 12:30:18', NULL),
(863, 336, '', 'Partial payment made via Cash. Amount: ₱130.00. Reference: CASH-20250503160255', '2025-05-03 14:02:55', NULL),
(864, 336, '', 'Partial payment made via Cash. Amount: ₱60.00. Reference: CASH-20250503160301', '2025-05-03 14:03:01', NULL),
(865, 330, '', 'Partial payment made via Cash. Amount: ₱20.00. Reference: CASH-20250503160335', '2025-05-03 14:03:35', NULL),
(866, 331, '', 'Partial payment made via Cash. Amount: ₱20.00. Reference: CASH-20250503160455', '2025-05-03 14:04:55', NULL),
(867, 331, '', 'Partial payment made via Cash. Amount: ₱20.00. Reference: CASH-20250503160520', '2025-05-03 14:05:20', NULL),
(868, 335, '', 'Partial payment made via Cash. Amount: ₱60.00. Reference: CASH-20250503160826', '2025-05-03 14:08:26', NULL),
(869, 293, '', 'Partial payment made via Mobile. Amount: ₱180.00. Reference: 12345678910', '2025-05-03 14:34:09', NULL),
(870, 293, '', 'Partial payment made via Mobile. Amount: ₱180.00. Reference: 12345678910', '2025-05-03 14:34:09', NULL),
(871, 332, '', 'Partial payment made via Mobile. Amount: ₱130.00. Reference: 69', '2025-05-03 14:35:43', NULL),
(872, 332, '', 'Partial payment made via Mobile. Amount: ₱130.00. Reference: 69', '2025-05-03 14:35:43', NULL),
(873, 329, '', 'Partial payment made via Cash. Amount: ₱180.00. Reference: CASH-20250503163635', '2025-05-03 14:36:35', NULL),
(874, 329, '', 'Partial payment made via Cash. Amount: ₱180.00. Reference: CASH-20250503163635', '2025-05-03 14:36:35', NULL),
(875, 328, '', 'Partial payment made via Cash. Amount: ₱60.00. Reference: CASH-20250503164323', '2025-05-03 14:43:23', NULL),
(876, 328, '', 'Partial payment made via Cash. Amount: ₱60.00. Reference: CASH-20250503164323', '2025-05-03 14:43:23', NULL),
(877, 324, '', 'Partial payment made via Cash. Amount: ₱50.00. Reference: CASH-20250503165242', '2025-05-03 14:52:42', NULL),
(878, 324, '', 'Partial payment made via Cash. Amount: ₱50.00. Reference: CASH-20250503165242', '2025-05-03 14:52:42', NULL),
(879, 331, '', 'Partial payment made via Cash. Amount: ₱20.00. Reference: CASH-20250503165454', '2025-05-03 14:54:54', NULL),
(880, 331, '', 'Partial payment made via Cash. Amount: ₱20.00. Reference: CASH-20250503165454', '2025-05-03 14:54:54', NULL),
(881, 333, '', 'Partial payment made via Cash. Amount: ₱130.00. Reference: CASH-20250503173232', '2025-05-03 15:32:36', NULL),
(882, 333, '', 'Partial payment made via Cash. Amount: ₱130.00. Reference: CASH-20250503173237', '2025-05-03 15:32:37', NULL),
(883, 333, '', 'Partial payment made via Cash. Amount: ₱130.00. Reference: CASH-20250503173237', '2025-05-03 15:32:37', NULL),
(884, 333, '', 'Partial payment made via Cash. Amount: ₱130.00. Reference: CASH-20250503173237', '2025-05-03 15:32:37', NULL),
(885, 332, '', 'Partial payment made via Cash. Amount: ₱130.00. Reference: CASH-20250503173258', '2025-05-03 15:32:58', NULL),
(886, 332, '', 'Partial payment made via Cash. Amount: ₱130.00. Reference: CASH-20250503173258', '2025-05-03 15:32:58', NULL),
(887, 331, '', 'Partial payment made via Cash. Amount: ₱20.00. Reference: CASH-20250503174534', '2025-05-03 15:45:34', NULL),
(888, 339, '', 'Partial payment made via Cash. Amount: ₱1,950.00. Reference: CASH-20250503180703', '2025-05-03 16:07:03', NULL),
(889, 338, '', 'Partial payment made via Cash. Amount: ₱1,950.00. Reference: CASH-20250503180735', '2025-05-03 16:07:35', NULL),
(890, 329, '', 'Partial payment made via Cash. Amount: ₱180.00. Reference: CASH-20250503184529', '2025-05-03 16:45:29', NULL),
(891, 341, 'order', 'Order created', '2025-05-03 16:58:15', NULL),
(892, 341, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-05-03 16:58:31', NULL),
(893, 341, 'ready-to-pickup', 'Order is ready for pickup', '2025-05-03 16:58:39', NULL),
(894, 341, 'picked up', 'Order picked up by Siex', '2025-05-03 16:58:47', NULL),
(895, 341, 'completed', 'Order completed and inventory updated', '2025-05-03 16:59:04', NULL),
(896, 341, '', 'Partial payment made via Cash. Amount: ₱320.00. Reference: CASH-20250503185930', '2025-05-03 16:59:30', NULL),
(897, 341, '', 'Partial payment made via Cash. Amount: ₱320.00. Reference: CASH-20250503192627', '2025-05-03 17:26:27', NULL),
(898, 323, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-05-03 18:08:55', 'Morning (7-12 am)'),
(899, 305, 'ready-to-pickup', 'Order is ready for pickup', '2025-05-03 18:16:21', NULL),
(900, 335, '', 'Partial payment made via Mobile. Amount: ₱60.00. Reference: 74821749812', '2025-05-03 18:17:33', NULL),
(901, 313, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-05-03 18:28:00', 'Morning (7-12 am)'),
(902, 320, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-05-03 18:29:24', 'Morning (7-12 am)'),
(903, 305, 'picked up', 'Order picked up by Fyave', '2025-05-03 19:22:16', NULL),
(904, 335, '', 'Payment status updated to: paid', '2025-05-04 07:29:11', NULL),
(905, 338, '', 'Payment status updated to: paid', '2025-05-04 07:33:09', NULL),
(906, 333, '', 'Payment status updated to: paid', '2025-05-04 07:42:19', NULL),
(907, 331, '', 'Payment status updated to: paid', '2025-05-04 09:59:52', NULL),
(908, 339, '', 'Payment status updated to: paid', '2025-05-04 10:09:30', NULL),
(909, 293, '', 'Payment status updated to: paid', '2025-05-04 10:52:45', NULL),
(910, 293, '', 'Partial payment made via Cash. Amount: ₱780.00. Reference: CASH-20250505110340', '2025-05-05 09:03:40', NULL),
(911, 305, 'return_requested', 'Return requested: Quality Issues', '2025-05-05 11:19:34', NULL),
(912, 341, '', 'Payment status updated to: paid', '2025-05-05 14:02:57', NULL),
(915, 342, 'order', 'Order created', '2025-05-05 16:24:05', NULL),
(916, 342, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-05-05 16:24:22', NULL),
(929, 353, 'order', 'Order created', '2025-05-06 09:35:13', NULL),
(933, 353, 'cancelled', 'Order cancelled by retailer', '2025-05-06 09:53:18', NULL),
(934, 353, 'order', 'Order placed again from cancelled order', '2025-05-06 09:53:22', NULL),
(935, 353, 'cancelled', 'Order cancelled by retailer', '2025-05-06 09:53:43', NULL),
(936, 353, 'order', 'Order placed again from cancelled order', '2025-05-06 09:54:05', NULL),
(937, 353, 'cancelled', 'Order cancelled by retailer', '2025-05-06 09:54:07', NULL),
(938, 353, 'order', 'Order placed again from cancelled order', '2025-05-06 09:54:08', NULL),
(939, 353, 'cancelled', 'Order cancelled by retailer', '2025-05-06 09:55:22', NULL),
(940, 353, 'order', 'Order placed again from cancelled order', '2025-05-06 09:55:25', NULL),
(941, 353, 'cancelled', 'Order cancelled by retailer', '2025-05-06 09:58:52', NULL),
(942, 353, 'order', 'Order placed again from cancelled order', '2025-05-06 09:58:56', NULL),
(943, 353, 'cancelled', 'Order cancelled by retailer', '2025-05-06 09:59:26', NULL),
(944, 353, 'order', 'Order placed again from cancelled order', '2025-05-06 09:59:28', NULL),
(945, 309, 'completed', 'Order completed and inventory updated', '2025-05-06 09:59:39', NULL),
(946, 354, 'order', 'Order created', '2025-05-06 10:49:28', NULL),
(947, 330, '', 'Partial payment made via Cash. Amount: ₱130.00. Reference: CASH-20250506130225', '2025-05-06 11:02:25', NULL),
(948, 318, 'completed', 'Order completed and inventory updated', '2025-05-06 11:03:32', NULL),
(949, 318, '', 'Partial payment made via Cash. Amount: ₱180.00. Reference: CASH-20250506130345', '2025-05-06 11:03:45', NULL),
(950, 318, '', 'Payment status updated to: paid', '2025-05-06 11:04:02', NULL),
(952, 356, 'order', 'Order created', '2025-05-06 18:31:36', NULL),
(953, 356, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-05-06 18:32:45', NULL),
(954, 356, 'shipped', 'Order has been shipped. Delivery: Evening (6-8 pm)', '2025-05-06 18:33:31', 'Evening (6-8 pm)'),
(955, 356, 'delivered', 'Order has been delivered', '2025-05-06 18:33:43', NULL),
(956, 342, 'ready-to-pickup', 'Order is ready for pickup', '2025-05-06 18:33:47', NULL),
(957, 356, 'return_requested', 'Return requested: Quality Issues', '2025-05-06 18:34:20', NULL),
(958, 356, 'delivered', 'Return request resolved: test', '2025-05-06 18:37:38', NULL),
(959, 356, 'completed', 'Order completed and inventory updated', '2025-05-06 18:37:52', NULL),
(960, 356, '', 'Partial payment made via Cash. Amount: ₱260.00. Reference: CASH-20250506203802', '2025-05-06 18:38:02', NULL),
(961, 353, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-05-06 19:00:15', NULL),
(962, 353, 'ready-to-pickup', 'Order is ready for pickup', '2025-05-06 19:00:30', NULL),
(963, 353, 'picked up', 'Order picked up by Siex', '2025-05-06 19:00:59', NULL),
(965, 336, '', 'Partial payment made via Cash. Amount: ₱130.00. Reference: CASH-20250507005256', '2025-05-06 22:52:56', NULL),
(966, 286, '', 'Partial payment made via Cash. Amount: ₱180.00. Reference: CASH-20250507010001', '2025-05-06 23:00:01', NULL),
(967, 357, 'order', 'Order created', '2025-05-06 23:18:05', NULL),
(968, 357, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-05-06 23:18:38', NULL),
(969, 357, 'shipped', 'Order has been shipped. Delivery: Afternoon (12-6 pm)', '2025-05-06 23:19:07', 'Afternoon (12-6 pm)'),
(970, 357, 'delivered', 'Order has been delivered', '2025-05-06 23:19:24', NULL),
(971, 357, 'completed', 'Order completed and inventory updated', '2025-05-06 23:19:40', NULL),
(972, 329, '', 'Payment status updated to: paid', '2025-05-15 03:54:27', NULL),
(973, 324, '', 'Payment status updated to: paid', '2025-05-15 03:54:34', NULL),
(974, 293, '', 'Payment status updated to: paid', '2025-05-15 03:54:39', NULL),
(975, 356, '', 'Payment status updated to: paid', '2025-05-15 03:54:44', NULL),
(976, 354, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-05-15 05:34:33', NULL),
(977, 325, 'delivered', 'Order has been delivered', '2025-05-15 07:07:44', NULL),
(978, 354, 'shipped', 'Order has been shipped. Delivery: Morning (7-12 am)', '2025-05-21 12:10:55', 'Morning (7-12 am)'),
(979, 336, '', 'Payment status updated to: paid', '2025-05-25 06:32:37', NULL),
(980, 330, '', 'Payment status updated to: paid', '2025-05-25 06:32:41', NULL),
(981, 332, '', 'Payment status updated to: paid', '2025-05-25 06:32:44', NULL),
(982, 286, '', 'Payment status updated to: paid', '2025-05-25 06:32:47', NULL),
(983, 358, 'order', 'Order created', '2025-05-28 06:46:10', NULL),
(984, 358, 'cancelled', 'Order cancelled by retailer', '2025-06-19 20:48:19', NULL),
(985, 358, 'order', 'Order placed again from cancelled order', '2025-06-19 20:48:26', NULL),
(986, 358, 'cancelled', 'Order cancelled by retailer', '2025-06-19 20:48:29', NULL),
(987, 359, 'order', 'Order created', '2025-06-20 06:23:09', NULL),
(988, 359, 'confirmed', 'Your order is confirmed and will be prepared shortly. Thank you for your order!', '2025-06-20 06:27:37', NULL),
(989, 357, '', 'Partial payment made via Mobile. Amount: ₱650.00. Reference: 121', '2025-06-20 06:30:42', NULL),
(990, 357, '', 'Payment status updated to: paid', '2025-06-20 06:31:52', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `retailer_payments`
--

CREATE TABLE `retailer_payments` (
  `payment_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `payment_method` enum('cash','online') NOT NULL,
  `payment_amount` decimal(10,2) NOT NULL,
  `payment_date` datetime NOT NULL,
  `reference_number` varchar(50) DEFAULT NULL,
  `payment_platform` varchar(50) DEFAULT NULL,
  `amount_received` decimal(10,2) DEFAULT NULL,
  `change_amount` decimal(10,2) DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `tax` decimal(10,2) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `retailer_payment_items`
--

CREATE TABLE `retailer_payment_items` (
  `item_id` int(11) NOT NULL,
  `payment_id` int(11) NOT NULL,
  `product_id` varchar(10) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `retailer_pickup_orders`
--

CREATE TABLE `retailer_pickup_orders` (
  `pickup_order_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `po_number` varchar(50) DEFAULT NULL,
  `retailer_name` varchar(100) NOT NULL,
  `retailer_email` varchar(100) DEFAULT NULL,
  `retailer_contact` varchar(50) DEFAULT NULL,
  `order_date` datetime NOT NULL,
  `pickup_location` varchar(255) NOT NULL,
  `pickup_date` date DEFAULT NULL,
  `pickup_status` enum('order','confirmed','ready','picked up','cancelled') DEFAULT 'order',
  `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `tax` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `retailer_pickup_status_history`
--

CREATE TABLE `retailer_pickup_status_history` (
  `history_id` int(11) NOT NULL,
  `pickup_order_id` int(11) NOT NULL,
  `pickup_status` enum('order','confirmed','ready','picked up','cancelled') DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `retailer_profiles`
--

CREATE TABLE `retailer_profiles` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `birthday` date NOT NULL,
  `age` int(11) DEFAULT NULL,
  `nationality` varchar(100) NOT NULL,
  `business_name` varchar(255) NOT NULL,
  `business_type` varchar(100) NOT NULL,
  `province` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `barangay` varchar(100) DEFAULT NULL,
  `house_number` varchar(255) DEFAULT NULL,
  `address_notes` text DEFAULT NULL,
  `business_address` text NOT NULL,
  `phone` varchar(50) NOT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `facebook` varchar(255) DEFAULT NULL,
  `instagram` varchar(255) DEFAULT NULL,
  `tiktok` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `retailer_profiles`
--

INSERT INTO `retailer_profiles` (`id`, `user_id`, `first_name`, `last_name`, `birthday`, `age`, `nationality`, `business_name`, `business_type`, `province`, `city`, `barangay`, `house_number`, `address_notes`, `business_address`, `phone`, `profile_image`, `facebook`, `instagram`, `tiktok`, `created_at`, `updated_at`) VALUES
(4, 6, 'Tuh', 'Targaryen', '2025-04-10', 0, 'Filipino', 'TuhStorey', '0', NULL, NULL, NULL, NULL, 'Calauan', 'Calauan', '+639949407497', NULL, '', '', '', '2025-04-10 08:43:10', '2025-04-12 00:31:49'),
(10, 12, 'Eighth', 'Targaryen', '2009-10-20', 15, 'Filipino', 'Storey', '0', NULL, NULL, NULL, NULL, 'Dayap', 'Dayap', '+639746573957', NULL, 'Eighth Targaryen', '', '', '2025-04-10 11:42:52', '2025-04-12 00:31:49'),
(11, 13, 'Aeroiz', 'Clive', '2006-11-06', 18, 'Filipino', 'Erostore', '0', NULL, NULL, NULL, NULL, 'Calauan', 'Calauan', '+639846483945', NULL, 'Aeroiz Clive', '', '', '2025-04-10 11:44:49', '2025-04-12 00:31:49'),
(14, 16, 'Jhovan', 'Magno', '2004-07-21', 20, 'Filipino', 'Vann', '0', NULL, NULL, NULL, NULL, 'Site 3', 'Site 3', '+639949407497', NULL, 'Jhovan Magno', '', '', '2025-04-10 12:35:38', '2025-04-12 00:31:49'),
(16, 18, 'Siex', 'Targaryen', '2004-11-09', 20, 'Filipino', 'Siexta', '0', NULL, NULL, NULL, NULL, '0', '0', '+6397463837465', '../uploads/profile_images/profile_18_1744364171.jpg', 'Siex Targaryen', '', '', '2025-04-11 06:27:58', '2025-04-12 00:31:49'),
(17, 19, 'Sevence', 'Targaryens', '2006-06-14', 18, 'Filipino', 'Sevencense', '0', NULL, NULL, NULL, NULL, '0', '0', '+639837483937', '../uploads/profile_images/profile_19_1744364105.jpg', 'Sevence Targaryen', '', '', '2025-04-11 06:37:38', '2025-04-12 00:31:49'),
(18, 20, 'Van', 'Clive', '2005-11-06', 19, 'Filipino', 'Vangame', '0', 'Laguna', 'Calauan', 'Dayap', 'site 3', '', 'site 3, Barangay Dayap, Calauan, Laguna', '639749374734', NULL, 'Jhovan Magno', '', '', '2025-04-12 00:34:02', '2025-05-01 13:06:31'),
(19, 21, 'Fyave', 'Targaryen', '2001-06-13', 23, 'Filipino', 'Fyaveorite', '0', 'Laguna', 'Calauan', 'San Isidro', 'purok 5', 'inc', 'Calauan', '639495027266', '../uploads/profile_images/profile_21_1748356914.png', 'Fyave Targaryen', '', '', '2025-04-22 05:28:30', '2025-05-27 14:41:54'),
(22, 24, 'Fohr', 'Targaryen', '2005-12-07', 19, '', '', 'Retail Store', '43400000', '043406000', '043406017', '3', '', '3, Barangay 043406017, 043406000, 043400000', '+639495027266', '../uploads/profile_images/profile_24_1745469153.png', '', '', '', '2025-04-23 10:30:39', '2025-04-24 04:32:33'),
(27, 29, 'Zorin', 'Magnus', '2003-09-10', 21, '', '', 'Retail Store', '43400000', '043406000', '043406017', 'Site 3', '', 'Site 3, Barangay 043406017, 043406000, 043400000', '+639495027266', NULL, '', '', '', '2025-05-28 03:36:05', '2025-05-28 03:36:05'),
(28, 30, 'Pepito', 'Manaloto', '2007-07-24', 17, '', 'A&A', 'Supermarket', '43400000', '043402000', '043402002', '123', 'Near a church', '123, Barangay 043402002, 043402000, 043400000', '+639283900824', NULL, '', '', '', '2025-06-20 06:39:31', '2025-06-20 06:39:31');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` enum('physical','online') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `address` text DEFAULT NULL,
  `contact_name` varchar(100) DEFAULT NULL,
  `contact_number` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `opening_hours` varchar(255) DEFAULT NULL,
  `delivery_info` varchar(100) DEFAULT NULL,
  `communication_mode` varchar(50) DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `platform` varchar(50) DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `name`, `type`, `created_at`, `updated_at`, `address`, `contact_name`, `contact_number`, `email`, `opening_hours`, `delivery_info`, `communication_mode`, `link`, `platform`, `notes`) VALUES
(2, 'testing', 'physical', '2025-05-15 15:02:53', '2025-05-20 04:50:32', 'doon lang', 'esther', '+63 9949407497', 'wan@gmail.com', '45', '3rd Party', 'WhatsApp', NULL, NULL, 'yessir'),
(9, 'inspi', 'online', '2025-05-20 00:53:10', '2025-05-20 05:30:19', NULL, NULL, NULL, NULL, NULL, 'Business Driver', NULL, 'inspi.com', 'Lazada', 'yessir');

-- --------------------------------------------------------

--
-- Table structure for table `supplier_alternatives`
--

CREATE TABLE `supplier_alternatives` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(50) NOT NULL,
  `contact_info` text DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `contact_name` varchar(100) DEFAULT NULL,
  `contact_number` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `opening_hours` varchar(255) DEFAULT NULL,
  `platform` varchar(100) DEFAULT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `is_fixed_pineapple` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `farm_location` varchar(255) DEFAULT NULL,
  `delivery_info` varchar(255) DEFAULT NULL,
  `communication_mode` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `harvest_season` varchar(255) DEFAULT NULL,
  `planting_cycle` varchar(255) DEFAULT NULL,
  `variety` varchar(255) DEFAULT NULL,
  `shelf_life` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `supplier_alternatives`
--

INSERT INTO `supplier_alternatives` (`id`, `name`, `type`, `contact_info`, `link`, `address`, `contact_name`, `contact_number`, `email`, `opening_hours`, `platform`, `supplier_id`, `is_fixed_pineapple`, `created_at`, `updated_at`, `farm_location`, `delivery_info`, `communication_mode`, `notes`, `harvest_season`, `planting_cycle`, `variety`, `shelf_life`) VALUES
(4, 'ds', '', '', 'youtube.com', NULL, NULL, NULL, NULL, NULL, NULL, 2, 0, '2025-05-19 11:21:29', '2025-05-19 11:21:29', '', '3rd Party', '', 'dwd', '', '', '', ''),
(21, 'qwe', '', '', 'yes.com', '', '', '', '', '', NULL, 9, 0, '2025-05-20 02:45:39', '2025-05-20 02:45:39', '', 'Business Driver', '', 'qr2', '', '', '', ''),
(31, 'dd', '', '', 'yes.com', '', '', '', '', '', NULL, 2, 0, '2025-05-20 03:11:44', '2025-05-20 03:11:44', '', '3rd Party', '', 'q', '', '', '', ''),
(32, 'dd', '', '', 'yes.com', '', '', '', '', '', NULL, 2, 0, '2025-05-20 03:11:44', '2025-05-20 03:11:44', '', '3rd Party', '', 'q', '', '', '', ''),
(34, 'yes', '', '+63 6545464', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2025-05-20 05:28:39', '2025-05-20 05:28:39', 'Molino, Bacoor, Cavite, Region IV-A', 'Pick Up', 'WhatsApp', 'et', 'January-April', '15-20 months', 'Red Spanish', '3-5 days at room temperature');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','cashier','retailer') NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `email_verified` tinyint(1) NOT NULL DEFAULT 0,
  `verification_token` varchar(255) DEFAULT NULL,
  `verification_expires` datetime DEFAULT NULL,
  `approval_status` enum('pending','approved','rejected') DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `email`, `full_name`, `created_at`, `last_login`, `is_active`, `email_verified`, `verification_token`, `verification_expires`, `approval_status`) VALUES
(1, 'businesspos', 'businesspospassword', 'admin', 'admin@pinana.com', 'POS', '2025-03-20 14:01:08', NULL, 1, 0, NULL, NULL, 'pending'),
(2, 'businessadmin', '$2y$10$1krAKIufORu071I0LYvuAeoMl0f/FGNz/u7mNE8W3Vd6HwRDrqrfG', 'admin', 'pinanagourmet@gmail.com', 'Pinana Gourmet', '2025-03-20 15:43:46', '2025-06-19 21:27:16', 1, 1, NULL, NULL, 'pending'),
(6, 'pospinyana', '$2y$10$HygrbeRk8vFTlKqU.9fXO.JAXkuKKywf.XwiKrwxvTlmtW/Rb4xt6', 'cashier', 'tuhtargaryen@gmail.com', 'Tuh Targaryen', '2025-04-10 08:43:10', '2025-05-07 00:30:59', 1, 1, NULL, '2025-04-17 15:38:27', 'pending'),
(12, 'eighthqt', '$2y$10$5wdwPfO4etp3X.BJPOngk.noi4RjpVjeuNxKfKJNQkyQ7Qhx9OI0a', 'retailer', 'eighthtargaryen@gmail.com', 'Eighth Targaryen', '2025-04-10 11:42:52', '2025-05-05 16:21:31', 1, 1, NULL, '2025-04-11 15:24:11', 'pending'),
(13, 'aeroizclive', '$2y$10$raQ4v4H1fafj/ShuBIXd5OlvbFta8JykeUExjiPm5xjoGESVzmMfO', 'retailer', 'aeroizclive@gmail.com', 'Aeroiz Clive', '2025-04-10 11:44:49', NULL, 1, 1, NULL, '2025-04-11 16:40:48', 'pending'),
(16, 'Zorinn', '$2y$10$I1oZhwGu3KmPZZG7p4XIq.nxJHX1XgE7Yzr1Zv5t7OpgUxQFa3HVu', 'retailer', 'jhovanmagno74@gmail.com', 'Jhovan Magno', '2025-04-10 12:35:38', NULL, 0, 0, 'f55ab738836df551f056d4bfc8741b00ca0a440e00f1487db78285506a6ca521', '2025-04-11 14:40:24', 'rejected'),
(18, 'siexy', '$2y$10$tKBb.IVFCgadtbHkLz7COuMuFbUZJBQahTCShQDEucF/h5ZHlxIki', 'retailer', 'siextargaryen@gmail.com', 'Siex Targaryen', '2025-04-11 06:27:58', '2025-05-07 04:46:48', 1, 1, NULL, '2025-04-12 08:28:06', 'approved'),
(19, 'se.vence', '$2y$10$0pO9fKMMA7ulLtndhjaLG.2L2HZAPQPpSHVy6VukiyCHjKb5PRPC2', 'retailer', 'sevencetargaryen@gmail.com', 'Sevence Targaryen', '2025-04-11 06:37:38', '2025-05-06 18:33:13', 1, 1, NULL, '2025-04-12 08:37:48', 'approved'),
(20, 'aer_van', '$2y$10$sUNtRopRpymtZ7ujYZdOJeVAMXT3feX7DoRVHQEJnat/7DGRMdJfK', 'retailer', 'vanngaming2003@gmail.com', 'Van Clive', '2025-04-12 00:34:02', '2025-05-02 03:49:06', 1, 1, NULL, '2025-04-13 02:34:12', 'approved'),
(21, 'fyaver', '$2y$10$KTF3TY4slkQEM8lUPJNgfuD7NcUVnYkuEVDlacV22MJgBHIZpuQ5y', 'retailer', 'fyavetargaryen@gmail.com', 'Fyave Targaryen', '2025-04-22 05:28:30', '2025-06-20 06:19:20', 1, 1, NULL, '2025-04-23 07:28:42', 'approved'),
(24, 'Wanpiece', '$2y$10$G7iAIb8oX3yrgsRQoz8Bpe7CAQD3zScpwBsoj.DUo..ptFsPulUmW', 'retailer', 'fohrtargaryen@gmail.com', 'Fohr Targaryen', '2025-04-23 10:30:39', '2025-05-07 00:20:13', 1, 1, NULL, '2025-04-24 12:30:46', 'approved'),
(29, 'zorin', '$2y$10$u4YFtoGjUvoDRFkaBa7Xneblm3Kzr1LN6GzN/RYoMKpZj3P9.n8Ce', 'retailer', 'zorinmagnus@gmail.com', 'Zorin Magnus', '2025-05-28 03:36:05', '2025-05-28 03:38:03', 1, 1, NULL, '2025-05-29 05:36:13', 'approved'),
(30, 'pepito', '$2y$10$lbpi8qQoiVAQYyYjpHegJuc62gWdPgbyXFezQP6po/51kcLvrv3zO', 'retailer', 'tureetargaryen@gmail.com', 'Pepito Manaloto', '2025-06-20 06:39:31', NULL, 0, 0, '9ad54ba626a928096a2d09b8f2caaa2515a49bab3afe1b772c59ed8d0292283c', '2025-06-21 08:39:58', 'pending');

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_production_summary`
-- (See below for the actual view)
--
CREATE TABLE `v_production_summary` (
`id` int(11)
,`production_id` varchar(50)
,`product_name` varchar(255)
,`category` varchar(100)
,`batch_size` int(11)
,`priority` enum('low','normal','high','urgent')
,`status` enum('pending','in-progress','quality-check','completed','cancelled','on-hold')
,`progress` decimal(5,2)
,`start_date` date
,`estimated_completion` datetime
,`actual_completion` datetime
,`production_type` enum('new-product','existing-batch','custom')
,`quantity_produced` int(11)
,`quantity_passed_qc` int(11)
,`quality_score` decimal(5,2)
,`total_cost` decimal(10,2)
,`cost_per_unit` decimal(10,4)
,`production_cost` decimal(10,2)
,`actual_duration_hours` bigint(21)
,`total_steps` bigint(21)
,`completed_steps` bigint(21)
);

-- --------------------------------------------------------

--
-- Structure for view `v_production_summary`
--
DROP TABLE IF EXISTS `v_production_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_production_summary`  AS SELECT `p`.`id` AS `id`, `p`.`production_id` AS `production_id`, `p`.`product_name` AS `product_name`, `p`.`category` AS `category`, `p`.`batch_size` AS `batch_size`, `p`.`priority` AS `priority`, `p`.`status` AS `status`, `p`.`progress` AS `progress`, `p`.`start_date` AS `start_date`, `p`.`estimated_completion` AS `estimated_completion`, `p`.`actual_completion` AS `actual_completion`, `p`.`production_type` AS `production_type`, `po`.`quantity_produced` AS `quantity_produced`, `po`.`quantity_passed_qc` AS `quantity_passed_qc`, `po`.`quality_score` AS `quality_score`, `po`.`total_cost` AS `total_cost`, `po`.`cost_per_unit` AS `cost_per_unit`, coalesce(`po`.`total_cost`,0) AS `production_cost`, CASE WHEN `p`.`actual_completion` is not null THEN timestampdiff(HOUR,`p`.`start_date`,`p`.`actual_completion`) ELSE NULL END AS `actual_duration_hours`, (select count(0) from `production_steps` `ps` where `ps`.`production_id` = `p`.`id`) AS `total_steps`, (select count(0) from `production_steps` `ps` where `ps`.`production_id` = `p`.`id` and `ps`.`status` = 'completed') AS `completed_steps` FROM (`productions` `p` left join `production_output` `po` on(`p`.`id` = `po`.`production_id`)) ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `batch_history`
--
ALTER TABLE `batch_history`
  ADD PRIMARY KEY (`history_id`),
  ADD KEY `batch_id` (`batch_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `transaction_id` (`transaction_id`);

--
-- Indexes for table `deliveries`
--
ALTER TABLE `deliveries`
  ADD PRIMARY KEY (`delivery_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `delivery_issues`
--
ALTER TABLE `delivery_issues`
  ADD PRIMARY KEY (`issue_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `equipment_usage`
--
ALTER TABLE `equipment_usage`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_production_id` (`production_id`),
  ADD KEY `idx_production_step_id` (`production_step_id`),
  ADD KEY `idx_equipment_name` (`equipment_name`),
  ADD KEY `idx_usage_start` (`usage_start`);

--
-- Indexes for table `fixed_pineapple_supplier`
--
ALTER TABLE `fixed_pineapple_supplier`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `inventory_log`
--
ALTER TABLE `inventory_log`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `change_type` (`change_type`),
  ADD KEY `created_at` (`created_at`);

--
-- Indexes for table `last_check_times`
--
ALTER TABLE `last_check_times`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `check_type` (`check_type`),
  ADD KEY `check_type_2` (`check_type`);

--
-- Indexes for table `material_batches`
--
ALTER TABLE `material_batches`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_batch_material` (`material_id`);

--
-- Indexes for table `material_containers`
--
ALTER TABLE `material_containers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `material_id` (`material_id`),
  ADD KEY `batch_id` (`batch_id`);

--
-- Indexes for table `material_usage_log`
--
ALTER TABLE `material_usage_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `material_id` (`material_id`);

--
-- Indexes for table `measurement_conversions`
--
ALTER TABLE `measurement_conversions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notification_id` (`notification_id`),
  ADD KEY `related_id` (`related_id`),
  ADD KEY `is_read` (`is_read`),
  ADD KEY `created_at` (`created_at`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_id` (`order_id`),
  ADD KEY `order_date` (`order_date`),
  ADD KEY `status` (`status`);

--
-- Indexes for table `order_batch_usage`
--
ALTER TABLE `order_batch_usage`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `batch_id` (`batch_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `order_status_history`
--
ALTER TABLE `order_status_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `payment_history`
--
ALTER TABLE `payment_history`
  ADD PRIMARY KEY (`history_id`),
  ADD KEY `payment_id` (`payment_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_history_order` (`order_id`),
  ADD KEY `idx_history_date` (`created_at`);

--
-- Indexes for table `pos_payment_methods`
--
ALTER TABLE `pos_payment_methods`
  ADD PRIMARY KEY (`payment_method_id`),
  ADD UNIQUE KEY `method_name` (`method_name`);

--
-- Indexes for table `pos_shifts`
--
ALTER TABLE `pos_shifts`
  ADD PRIMARY KEY (`shift_id`),
  ADD KEY `idx_cashier_id` (`cashier_id`),
  ADD KEY `idx_start_time` (`start_time`),
  ADD KEY `idx_end_time` (`end_time`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `pos_transactions`
--
ALTER TABLE `pos_transactions`
  ADD PRIMARY KEY (`transaction_id`),
  ADD KEY `idx_transaction_date` (`transaction_date`),
  ADD KEY `idx_customer_id` (`customer_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `pos_transaction_items`
--
ALTER TABLE `pos_transaction_items`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `transaction_id` (`transaction_id`),
  ADD KEY `idx_product_id` (`product_id`);

--
-- Indexes for table `pos_transaction_payments`
--
ALTER TABLE `pos_transaction_payments`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `transaction_id` (`transaction_id`),
  ADD KEY `payment_method_id` (`payment_method_id`),
  ADD KEY `idx_payment_date` (`payment_date`),
  ADD KEY `idx_payment_status` (`payment_status`);

--
-- Indexes for table `pos_transaction_refunds`
--
ALTER TABLE `pos_transaction_refunds`
  ADD PRIMARY KEY (`refund_id`),
  ADD KEY `transaction_id` (`transaction_id`),
  ADD KEY `refund_method_id` (`refund_method_id`),
  ADD KEY `idx_refund_date` (`refund_date`);

--
-- Indexes for table `productions`
--
ALTER TABLE `productions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `production_id` (`production_id`),
  ADD KEY `idx_production_id` (`production_id`),
  ADD KEY `idx_product_id` (`product_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_start_date` (`start_date`),
  ADD KEY `idx_priority` (`priority`),
  ADD KEY `idx_productions_status_date` (`status`,`start_date`),
  ADD KEY `idx_productions_date_status` (`start_date`,`status`),
  ADD KEY `idx_productions_type_priority` (`production_type`,`priority`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_productions_category_status` (`category`,`status`);

--
-- Indexes for table `production_alerts`
--
ALTER TABLE `production_alerts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `alert_id` (`alert_id`),
  ADD UNIQUE KEY `uk_alert_id` (`alert_id`),
  ADD KEY `idx_production_id` (`production_id`),
  ADD KEY `idx_material_id` (`material_id`),
  ADD KEY `idx_alert_type` (`alert_type`),
  ADD KEY `idx_severity` (`severity`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_triggered_at` (`triggered_at`);

--
-- Indexes for table `production_analytics`
--
ALTER TABLE `production_analytics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_production_id` (`production_id`),
  ADD KEY `idx_metric_name` (`metric_name`),
  ADD KEY `idx_measurement_date` (`measurement_date`);

--
-- Indexes for table `production_costs`
--
ALTER TABLE `production_costs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_production_id` (`production_id`),
  ADD KEY `idx_cost_type` (`cost_type`),
  ADD KEY `idx_cost_date` (`cost_date`),
  ADD KEY `idx_supplier_id` (`supplier_id`);

--
-- Indexes for table `production_materials`
--
ALTER TABLE `production_materials`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_production_material` (`production_id`,`material_id`),
  ADD KEY `idx_production_material` (`production_id`,`material_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_production_materials_status` (`status`,`production_id`),
  ADD KEY `idx_production_id` (`production_id`),
  ADD KEY `idx_material_id` (`material_id`),
  ADD KEY `idx_consumption_date` (`consumption_date`);

--
-- Indexes for table `production_material_usage`
--
ALTER TABLE `production_material_usage`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_production_usage` (`production_id`,`material_id`),
  ADD KEY `idx_material_batch` (`material_batch_id`),
  ADD KEY `idx_usage_date` (`usage_date`),
  ADD KEY `idx_usage_type` (`usage_type`),
  ADD KEY `production_material_id` (`production_material_id`),
  ADD KEY `idx_material_usage_date_type` (`usage_date`,`usage_type`),
  ADD KEY `idx_production_id` (`production_id`),
  ADD KEY `idx_material_id` (`material_id`),
  ADD KEY `idx_production_step_id` (`production_step_id`);

--
-- Indexes for table `production_output`
--
ALTER TABLE `production_output`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_production_output` (`production_id`),
  ADD KEY `idx_batch_code` (`output_batch_code`),
  ADD KEY `idx_manufacturing_date` (`manufacturing_date`),
  ADD KEY `idx_created_product` (`created_product_id`),
  ADD KEY `idx_created_batch` (`created_batch_id`),
  ADD KEY `idx_production_id` (`production_id`),
  ADD KEY `idx_output_batch_code` (`output_batch_code`),
  ADD KEY `idx_expiration_date` (`expiration_date`);

--
-- Indexes for table `production_quality_checks`
--
ALTER TABLE `production_quality_checks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_production_id` (`production_id`),
  ADD KEY `idx_production_step_id` (`production_step_id`),
  ADD KEY `idx_check_type` (`check_type`),
  ADD KEY `idx_pass_fail` (`pass_fail`),
  ADD KEY `idx_checked_at` (`checked_at`);

--
-- Indexes for table `production_recipes`
--
ALTER TABLE `production_recipes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_recipe_id` (`recipe_id`),
  ADD KEY `idx_product_recipe` (`product_id`,`status`),
  ADD KEY `idx_recipe_name` (`recipe_name`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_product_id` (`product_id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_is_default` (`is_default`);

--
-- Indexes for table `production_status_history`
--
ALTER TABLE `production_status_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_production_id` (`production_id`),
  ADD KEY `idx_changed_at` (`changed_at`),
  ADD KEY `idx_new_status` (`new_status`);

--
-- Indexes for table `production_steps`
--
ALTER TABLE `production_steps`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_production_step` (`production_id`,`step_number`),
  ADD KEY `idx_production_step` (`production_id`,`step_number`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_assigned_to` (`assigned_to`),
  ADD KEY `depends_on_step` (`depends_on_step`),
  ADD KEY `idx_production_id` (`production_id`),
  ADD KEY `idx_step_number` (`step_number`),
  ADD KEY `idx_started_at` (`started_at`);

--
-- Indexes for table `production_waste`
--
ALTER TABLE `production_waste`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_production_id` (`production_id`),
  ADD KEY `idx_material_id` (`material_id`),
  ADD KEY `idx_waste_type` (`waste_type`),
  ADD KEY `idx_waste_category` (`waste_category`),
  ADD KEY `idx_recorded_at` (`recorded_at`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_product_id` (`product_id`),
  ADD KEY `idx_products_name` (`product_name`),
  ADD KEY `idx_products_expiration` (`expiration_date`),
  ADD KEY `idx_production_reference` (`production_reference`);

--
-- Indexes for table `product_batches`
--
ALTER TABLE `product_batches`
  ADD PRIMARY KEY (`batch_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `expiration_date` (`expiration_date`),
  ADD KEY `batch_code` (`batch_code`),
  ADD KEY `idx_batches_manufacturing` (`manufacturing_date`);

--
-- Indexes for table `product_price_history`
--
ALTER TABLE `product_price_history`
  ADD PRIMARY KEY (`history_id`),
  ADD KEY `idx_product_price_history_product_id` (`product_id`),
  ADD KEY `idx_product_price_history_retailer_id` (`retailer_id`);

--
-- Indexes for table `product_pricing`
--
ALTER TABLE `product_pricing`
  ADD PRIMARY KEY (`pricing_id`),
  ADD UNIQUE KEY `unique_product_retailer` (`product_id`,`retailer_id`),
  ADD KEY `idx_product_pricing_product_id` (`product_id`),
  ADD KEY `idx_product_pricing_retailer_id` (`retailer_id`);

--
-- Indexes for table `quality_checkpoints`
--
ALTER TABLE `quality_checkpoints`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `checkpoint_id` (`checkpoint_id`),
  ADD UNIQUE KEY `uk_checkpoint_id` (`checkpoint_id`),
  ADD KEY `idx_production_id` (`production_id`),
  ADD KEY `idx_production_step_id` (`production_step_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_inspection_date` (`inspection_date`);

--
-- Indexes for table `raw_materials`
--
ALTER TABLE `raw_materials`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `material_id` (`material_id`),
  ADD KEY `idx_material_name` (`name`),
  ADD KEY `idx_material_category` (`category`),
  ADD KEY `idx_material_supplier` (`supplier_id`),
  ADD KEY `idx_material_id` (`material_id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_date_received` (`date_received`);

--
-- Indexes for table `retailer_orders`
--
ALTER TABLE `retailer_orders`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `idx_payment_status` (`payment_status`),
  ADD KEY `idx_completed_orders` (`status`,`payment_status`);

--
-- Indexes for table `retailer_order_deliveries`
--
ALTER TABLE `retailer_order_deliveries`
  ADD PRIMARY KEY (`delivery_id`),
  ADD KEY `idx_order_deliveries` (`order_id`),
  ADD KEY `idx_delivery_status` (`delivery_status`);

--
-- Indexes for table `retailer_order_delivery_issues`
--
ALTER TABLE `retailer_order_delivery_issues`
  ADD PRIMARY KEY (`issue_id`),
  ADD KEY `idx_order_issues` (`order_id`),
  ADD KEY `idx_issue_status` (`issue_status`);

--
-- Indexes for table `retailer_order_issues`
--
ALTER TABLE `retailer_order_issues`
  ADD PRIMARY KEY (`issue_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `retailer_order_items`
--
ALTER TABLE `retailer_order_items`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `fk_order_id` (`order_id`);

--
-- Indexes for table `retailer_order_item_payments`
--
ALTER TABLE `retailer_order_item_payments`
  ADD PRIMARY KEY (`item_payment_id`),
  ADD KEY `item_id` (`item_id`),
  ADD KEY `fk_payment_id` (`payment_id`),
  ADD KEY `idx_retailer_order_item_payments_product` (`product_id`);

--
-- Indexes for table `retailer_order_item_verification`
--
ALTER TABLE `retailer_order_item_verification`
  ADD PRIMARY KEY (`verification_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `item_id` (`item_id`);

--
-- Indexes for table `retailer_order_payments`
--
ALTER TABLE `retailer_order_payments`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `retailer_order_returns`
--
ALTER TABLE `retailer_order_returns`
  ADD PRIMARY KEY (`return_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `retailer_order_return_items`
--
ALTER TABLE `retailer_order_return_items`
  ADD PRIMARY KEY (`return_item_id`),
  ADD KEY `return_id` (`return_id`),
  ADD KEY `item_id` (`item_id`);

--
-- Indexes for table `retailer_order_status_history`
--
ALTER TABLE `retailer_order_status_history`
  ADD PRIMARY KEY (`history_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `retailer_payments`
--
ALTER TABLE `retailer_payments`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_payment_order` (`order_id`),
  ADD KEY `idx_payment_date` (`payment_date`),
  ADD KEY `idx_payment_method` (`payment_method`);

--
-- Indexes for table `retailer_payment_items`
--
ALTER TABLE `retailer_payment_items`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `payment_id` (`payment_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `retailer_pickup_orders`
--
ALTER TABLE `retailer_pickup_orders`
  ADD PRIMARY KEY (`pickup_order_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `retailer_pickup_status_history`
--
ALTER TABLE `retailer_pickup_status_history`
  ADD PRIMARY KEY (`history_id`),
  ADD KEY `pickup_order_id` (`pickup_order_id`);

--
-- Indexes for table `retailer_profiles`
--
ALTER TABLE `retailer_profiles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_supplier_type` (`type`);

--
-- Indexes for table `supplier_alternatives`
--
ALTER TABLE `supplier_alternatives`
  ADD PRIMARY KEY (`id`),
  ADD KEY `supplier_id` (`supplier_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `batch_history`
--
ALTER TABLE `batch_history`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `deliveries`
--
ALTER TABLE `deliveries`
  MODIFY `delivery_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `delivery_issues`
--
ALTER TABLE `delivery_issues`
  MODIFY `issue_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `equipment_usage`
--
ALTER TABLE `equipment_usage`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fixed_pineapple_supplier`
--
ALTER TABLE `fixed_pineapple_supplier`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `inventory_log`
--
ALTER TABLE `inventory_log`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `last_check_times`
--
ALTER TABLE `last_check_times`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `material_batches`
--
ALTER TABLE `material_batches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `material_containers`
--
ALTER TABLE `material_containers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `material_usage_log`
--
ALTER TABLE `material_usage_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `measurement_conversions`
--
ALTER TABLE `measurement_conversions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `order_batch_usage`
--
ALTER TABLE `order_batch_usage`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=70;

--
-- AUTO_INCREMENT for table `order_status_history`
--
ALTER TABLE `order_status_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment_history`
--
ALTER TABLE `payment_history`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pos_payment_methods`
--
ALTER TABLE `pos_payment_methods`
  MODIFY `payment_method_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `pos_shifts`
--
ALTER TABLE `pos_shifts`
  MODIFY `shift_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pos_transaction_items`
--
ALTER TABLE `pos_transaction_items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- AUTO_INCREMENT for table `pos_transaction_payments`
--
ALTER TABLE `pos_transaction_payments`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT for table `pos_transaction_refunds`
--
ALTER TABLE `pos_transaction_refunds`
  MODIFY `refund_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `productions`
--
ALTER TABLE `productions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `production_alerts`
--
ALTER TABLE `production_alerts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `production_analytics`
--
ALTER TABLE `production_analytics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `production_costs`
--
ALTER TABLE `production_costs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `production_materials`
--
ALTER TABLE `production_materials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `production_material_usage`
--
ALTER TABLE `production_material_usage`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `production_output`
--
ALTER TABLE `production_output`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `production_quality_checks`
--
ALTER TABLE `production_quality_checks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `production_recipes`
--
ALTER TABLE `production_recipes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `production_status_history`
--
ALTER TABLE `production_status_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `production_steps`
--
ALTER TABLE `production_steps`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=103;

--
-- AUTO_INCREMENT for table `production_waste`
--
ALTER TABLE `production_waste`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=157;

--
-- AUTO_INCREMENT for table `product_batches`
--
ALTER TABLE `product_batches`
  MODIFY `batch_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=287;

--
-- AUTO_INCREMENT for table `product_price_history`
--
ALTER TABLE `product_price_history`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_pricing`
--
ALTER TABLE `product_pricing`
  MODIFY `pricing_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quality_checkpoints`
--
ALTER TABLE `quality_checkpoints`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `raw_materials`
--
ALTER TABLE `raw_materials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `retailer_orders`
--
ALTER TABLE `retailer_orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=360;

--
-- AUTO_INCREMENT for table `retailer_order_deliveries`
--
ALTER TABLE `retailer_order_deliveries`
  MODIFY `delivery_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `retailer_order_delivery_issues`
--
ALTER TABLE `retailer_order_delivery_issues`
  MODIFY `issue_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `retailer_order_issues`
--
ALTER TABLE `retailer_order_issues`
  MODIFY `issue_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `retailer_order_items`
--
ALTER TABLE `retailer_order_items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=359;

--
-- AUTO_INCREMENT for table `retailer_order_item_payments`
--
ALTER TABLE `retailer_order_item_payments`
  MODIFY `item_payment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `retailer_order_item_verification`
--
ALTER TABLE `retailer_order_item_verification`
  MODIFY `verification_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `retailer_order_payments`
--
ALTER TABLE `retailer_order_payments`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `retailer_order_returns`
--
ALTER TABLE `retailer_order_returns`
  MODIFY `return_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `retailer_order_return_items`
--
ALTER TABLE `retailer_order_return_items`
  MODIFY `return_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `retailer_order_status_history`
--
ALTER TABLE `retailer_order_status_history`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=991;

--
-- AUTO_INCREMENT for table `retailer_payments`
--
ALTER TABLE `retailer_payments`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `retailer_payment_items`
--
ALTER TABLE `retailer_payment_items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `retailer_pickup_orders`
--
ALTER TABLE `retailer_pickup_orders`
  MODIFY `pickup_order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `retailer_pickup_status_history`
--
ALTER TABLE `retailer_pickup_status_history`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `retailer_profiles`
--
ALTER TABLE `retailer_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `supplier_alternatives`
--
ALTER TABLE `supplier_alternatives`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `deliveries`
--
ALTER TABLE `deliveries`
  ADD CONSTRAINT `deliveries_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE;

--
-- Constraints for table `delivery_issues`
--
ALTER TABLE `delivery_issues`
  ADD CONSTRAINT `delivery_issues_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE;

--
-- Constraints for table `equipment_usage`
--
ALTER TABLE `equipment_usage`
  ADD CONSTRAINT `equipment_usage_ibfk_1` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `equipment_usage_ibfk_2` FOREIGN KEY (`production_step_id`) REFERENCES `production_steps` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `inventory_log`
--
ALTER TABLE `inventory_log`
  ADD CONSTRAINT `inventory_log_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  ADD CONSTRAINT `inventory_log_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `retailer_orders` (`order_id`) ON DELETE SET NULL;

--
-- Constraints for table `material_batches`
--
ALTER TABLE `material_batches`
  ADD CONSTRAINT `material_batches_ibfk_1` FOREIGN KEY (`material_id`) REFERENCES `raw_materials` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `material_containers`
--
ALTER TABLE `material_containers`
  ADD CONSTRAINT `material_containers_ibfk_1` FOREIGN KEY (`material_id`) REFERENCES `raw_materials` (`id`),
  ADD CONSTRAINT `material_containers_ibfk_2` FOREIGN KEY (`batch_id`) REFERENCES `material_batches` (`id`);

--
-- Constraints for table `material_usage_log`
--
ALTER TABLE `material_usage_log`
  ADD CONSTRAINT `material_usage_log_ibfk_1` FOREIGN KEY (`material_id`) REFERENCES `raw_materials` (`id`);

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE;

--
-- Constraints for table `order_status_history`
--
ALTER TABLE `order_status_history`
  ADD CONSTRAINT `order_status_history_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `retailer_orders` (`order_id`);

--
-- Constraints for table `payment_history`
--
ALTER TABLE `payment_history`
  ADD CONSTRAINT `payment_history_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `retailer_orders` (`order_id`),
  ADD CONSTRAINT `payment_history_ibfk_2` FOREIGN KEY (`payment_id`) REFERENCES `retailer_payments` (`payment_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payment_history_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `retailer_profiles` (`user_id`);

--
-- Constraints for table `pos_transaction_items`
--
ALTER TABLE `pos_transaction_items`
  ADD CONSTRAINT `pos_transaction_items_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `pos_transactions` (`transaction_id`) ON DELETE CASCADE;

--
-- Constraints for table `pos_transaction_payments`
--
ALTER TABLE `pos_transaction_payments`
  ADD CONSTRAINT `pos_transaction_payments_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `pos_transactions` (`transaction_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pos_transaction_payments_ibfk_2` FOREIGN KEY (`payment_method_id`) REFERENCES `pos_payment_methods` (`payment_method_id`);

--
-- Constraints for table `pos_transaction_refunds`
--
ALTER TABLE `pos_transaction_refunds`
  ADD CONSTRAINT `pos_transaction_refunds_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `pos_transactions` (`transaction_id`),
  ADD CONSTRAINT `pos_transaction_refunds_ibfk_2` FOREIGN KEY (`refund_method_id`) REFERENCES `pos_payment_methods` (`payment_method_id`);

--
-- Constraints for table `productions`
--
ALTER TABLE `productions`
  ADD CONSTRAINT `productions_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `production_alerts`
--
ALTER TABLE `production_alerts`
  ADD CONSTRAINT `fk_production_alerts_production` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `production_alerts_ibfk_1` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `production_alerts_ibfk_2` FOREIGN KEY (`material_id`) REFERENCES `raw_materials` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `production_analytics`
--
ALTER TABLE `production_analytics`
  ADD CONSTRAINT `production_analytics_ibfk_1` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `production_costs`
--
ALTER TABLE `production_costs`
  ADD CONSTRAINT `fk_production_costs_production` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `production_costs_ibfk_1` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `production_costs_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `production_materials`
--
ALTER TABLE `production_materials`
  ADD CONSTRAINT `fk_production_materials_production` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `production_materials_ibfk_1` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `production_materials_ibfk_2` FOREIGN KEY (`material_id`) REFERENCES `raw_materials` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `production_material_usage`
--
ALTER TABLE `production_material_usage`
  ADD CONSTRAINT `fk_material_usage_production` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_material_usage_step` FOREIGN KEY (`production_step_id`) REFERENCES `production_steps` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `production_material_usage_ibfk_1` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `production_material_usage_ibfk_2` FOREIGN KEY (`production_material_id`) REFERENCES `production_materials` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `production_material_usage_ibfk_3` FOREIGN KEY (`material_id`) REFERENCES `raw_materials` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `production_material_usage_ibfk_4` FOREIGN KEY (`material_batch_id`) REFERENCES `material_batches` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `production_material_usage_ibfk_5` FOREIGN KEY (`production_step_id`) REFERENCES `production_steps` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `production_output`
--
ALTER TABLE `production_output`
  ADD CONSTRAINT `fk_production_output_production` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `production_output_ibfk_1` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `production_output_ibfk_2` FOREIGN KEY (`created_product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `production_output_ibfk_3` FOREIGN KEY (`created_batch_id`) REFERENCES `product_batches` (`batch_id`) ON DELETE SET NULL;

--
-- Constraints for table `production_quality_checks`
--
ALTER TABLE `production_quality_checks`
  ADD CONSTRAINT `fk_quality_checks_production` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_quality_checks_step` FOREIGN KEY (`production_step_id`) REFERENCES `production_steps` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `production_recipes`
--
ALTER TABLE `production_recipes`
  ADD CONSTRAINT `production_recipes_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `production_status_history`
--
ALTER TABLE `production_status_history`
  ADD CONSTRAINT `fk_status_history_production` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `production_steps`
--
ALTER TABLE `production_steps`
  ADD CONSTRAINT `fk_production_steps_production` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `production_steps_ibfk_1` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `production_steps_ibfk_2` FOREIGN KEY (`depends_on_step`) REFERENCES `production_steps` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `production_waste`
--
ALTER TABLE `production_waste`
  ADD CONSTRAINT `production_waste_ibfk_1` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `production_waste_ibfk_2` FOREIGN KEY (`material_id`) REFERENCES `raw_materials` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `quality_checkpoints`
--
ALTER TABLE `quality_checkpoints`
  ADD CONSTRAINT `quality_checkpoints_ibfk_1` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quality_checkpoints_ibfk_2` FOREIGN KEY (`production_step_id`) REFERENCES `production_steps` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `retailer_order_deliveries`
--
ALTER TABLE `retailer_order_deliveries`
  ADD CONSTRAINT `retailer_order_deliveries_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `retailer_orders` (`order_id`) ON DELETE CASCADE;

--
-- Constraints for table `retailer_order_delivery_issues`
--
ALTER TABLE `retailer_order_delivery_issues`
  ADD CONSTRAINT `retailer_order_delivery_issues_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `retailer_orders` (`order_id`) ON DELETE CASCADE;

--
-- Constraints for table `retailer_order_issues`
--
ALTER TABLE `retailer_order_issues`
  ADD CONSTRAINT `retailer_order_issues_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `retailer_orders` (`order_id`) ON DELETE CASCADE;

--
-- Constraints for table `retailer_order_items`
--
ALTER TABLE `retailer_order_items`
  ADD CONSTRAINT `fk_order_id` FOREIGN KEY (`order_id`) REFERENCES `retailer_orders` (`order_id`) ON DELETE CASCADE;

--
-- Constraints for table `retailer_order_item_payments`
--
ALTER TABLE `retailer_order_item_payments`
  ADD CONSTRAINT `fk_payment_id` FOREIGN KEY (`payment_id`) REFERENCES `retailer_order_payments` (`payment_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  ADD CONSTRAINT `retailer_order_item_payments_ibfk_1` FOREIGN KEY (`payment_id`) REFERENCES `retailer_order_payments` (`payment_id`),
  ADD CONSTRAINT `retailer_order_item_payments_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `retailer_order_items` (`item_id`);

--
-- Constraints for table `retailer_order_item_verification`
--
ALTER TABLE `retailer_order_item_verification`
  ADD CONSTRAINT `retailer_order_item_verification_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `retailer_orders` (`order_id`),
  ADD CONSTRAINT `retailer_order_item_verification_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `retailer_order_items` (`item_id`);

--
-- Constraints for table `retailer_order_payments`
--
ALTER TABLE `retailer_order_payments`
  ADD CONSTRAINT `retailer_order_payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `retailer_orders` (`order_id`);

--
-- Constraints for table `retailer_order_returns`
--
ALTER TABLE `retailer_order_returns`
  ADD CONSTRAINT `retailer_order_returns_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `retailer_orders` (`order_id`);

--
-- Constraints for table `retailer_order_return_items`
--
ALTER TABLE `retailer_order_return_items`
  ADD CONSTRAINT `retailer_order_return_items_ibfk_1` FOREIGN KEY (`return_id`) REFERENCES `retailer_order_returns` (`return_id`),
  ADD CONSTRAINT `retailer_order_return_items_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `retailer_order_items` (`item_id`);

--
-- Constraints for table `retailer_order_status_history`
--
ALTER TABLE `retailer_order_status_history`
  ADD CONSTRAINT `retailer_order_status_history_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `retailer_orders` (`order_id`) ON DELETE CASCADE;

--
-- Constraints for table `retailer_payments`
--
ALTER TABLE `retailer_payments`
  ADD CONSTRAINT `retailer_payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `retailer_orders` (`order_id`),
  ADD CONSTRAINT `retailer_payments_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `retailer_profiles` (`user_id`);

--
-- Constraints for table `retailer_payment_items`
--
ALTER TABLE `retailer_payment_items`
  ADD CONSTRAINT `retailer_payment_items_ibfk_1` FOREIGN KEY (`payment_id`) REFERENCES `retailer_payments` (`payment_id`),
  ADD CONSTRAINT `retailer_payment_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);

--
-- Constraints for table `retailer_pickup_orders`
--
ALTER TABLE `retailer_pickup_orders`
  ADD CONSTRAINT `retailer_pickup_orders_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `retailer_orders` (`order_id`) ON DELETE CASCADE;

--
-- Constraints for table `retailer_pickup_status_history`
--
ALTER TABLE `retailer_pickup_status_history`
  ADD CONSTRAINT `retailer_pickup_status_history_ibfk_1` FOREIGN KEY (`pickup_order_id`) REFERENCES `retailer_pickup_orders` (`pickup_order_id`) ON DELETE CASCADE;

--
-- Constraints for table `retailer_profiles`
--
ALTER TABLE `retailer_profiles`
  ADD CONSTRAINT `retailer_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `supplier_alternatives`
--
ALTER TABLE `supplier_alternatives`
  ADD CONSTRAINT `supplier_alternatives_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
