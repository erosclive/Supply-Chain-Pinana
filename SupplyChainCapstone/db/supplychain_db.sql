-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 13, 2025 at 06:15 PM
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

--
-- Dumping data for table `deliveries`
--

INSERT INTO `deliveries` (`delivery_id`, `order_id`, `estimated_delivery_time`, `actual_delivery_time`, `delivery_notes`, `driver_id`, `rating`, `feedback`, `created_at`, `updated_at`) VALUES
(12, 'ORD-250329-13083', '2025-03-29 07:15:00', '2025-03-29 13:15:28', '\n', 'DRV001', NULL, '', '2025-03-29 13:15:20', '2025-03-29 13:15:28'),
(14, 'ORD-250329-16050', '2025-03-31 12:00:00', '2025-03-31 08:35:44', '\n', 'DRV001', NULL, '', '2025-03-31 08:35:24', '2025-03-31 08:35:44'),
(15, 'ORD-250409-93838', '2025-04-12 09:41:00', NULL, '', '', NULL, NULL, '2025-04-12 15:41:32', '2025-04-12 15:41:32');

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

--
-- Dumping data for table `delivery_issues`
--

INSERT INTO `delivery_issues` (`issue_id`, `order_id`, `issue_type`, `description`, `status`, `reported_at`, `resolved_at`, `resolution`) VALUES
(6, 'ORD-250329-16050', 'delay', 'delayed', 'resolved', '2025-03-30 01:19:34', '2025-03-30 01:19:49', 'ok na.');

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

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `order_id`, `customer_name`, `customer_email`, `customer_phone`, `shipping_address`, `order_date`, `status`, `payment_method`, `subtotal`, `tax`, `discount`, `total_amount`, `notes`, `created_at`, `updated_at`) VALUES
(44, 'ORD-250329-13083', 'Vann', 'aervanclive@gmail.com', '09949407497', 'calauan', '2025-03-29', 'delivered', 'cash', 650.00, 78.00, 0.00, 728.00, '', '2025-03-29 13:14:29', '2025-03-29 15:42:48'),
(45, 'ORD-250329-16050', 'Eros', 'erosclive@gmail.com', '09300442483', 'Edolas', '2025-03-30', 'delivered', 'cash', 650.00, 78.00, 0.00, 728.00, '', '2025-03-30 01:09:33', '2025-03-31 08:35:44'),
(51, 'ORD-250330-49051', 'Van', 'van@gmail.com', ' 09838732827', 'dayap', '2025-03-30', 'pending', 'cash', 50.00, 6.00, 0.00, 56.00, '', '2025-03-30 17:19:14', '2025-03-30 17:19:14'),
(53, 'ORD-250409-93838', 'Aer', 'aeroizclive@gmail.com', '09863287322', 'calauan', '2025-04-09', 'shipped', 'cash', 300.00, 36.00, 0.00, 336.00, '', '2025-04-09 12:45:04', '2025-04-12 15:41:32'),
(54, 'ORD-250409-82693', 'Alecto', 'alectoclive@gmail.com', '09900442483', 'santo tomas', '2025-04-09', 'pending', 'mobile_payment', 650.00, 78.00, 0.00, 728.00, '', '2025-04-09 15:06:18', '2025-04-09 15:06:18');

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

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`item_id`, `order_id`, `product_id`, `quantity`, `price`) VALUES
(57, 'ORD-250329-13083', 'P029', 5, 130.00),
(58, 'ORD-250329-16050', 'P036', 5, 130.00),
(64, 'ORD-250330-49051', 'P028', 1, 50.00),
(67, 'ORD-250409-82693', 'P033', 5, 130.00),
(68, 'ORD-250409-93838', 'P030', 6, 50.00);

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

--
-- Dumping data for table `order_status_history`
--

INSERT INTO `order_status_history` (`id`, `order_id`, `status`, `updated_at`) VALUES
(49, 'ORD-250329-13083', 'pending', '2025-03-29 13:14:29'),
(50, 'ORD-250329-13083', 'shipped', '2025-03-29 13:15:20'),
(51, 'ORD-250329-13083', 'delivered', '2025-03-29 13:15:28'),
(52, 'ORD-250329-16050', 'pending', '2025-03-30 01:09:33'),
(59, 'ORD-250330-49051', 'pending', '2025-03-30 17:19:14'),
(61, 'ORD-250329-16050', 'shipped', '2025-03-31 08:35:24'),
(62, 'ORD-250329-16050', 'delivered', '2025-03-31 08:35:44'),
(63, 'ORD-250409-93838', 'pending', '2025-04-09 12:45:04'),
(64, 'ORD-250409-82693', 'pending', '2025-04-09 15:06:18'),
(66, 'ORD-250409-93838', 'shipped', '2025-04-12 15:41:32');

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
('PG-10859', '2025-03-22 12:46:11', NULL, 'Guest', 60.00, 6.00, 0.00, 66.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-22 04:46:11', '2025-03-22 04:46:11'),
('PG-12855', '2025-03-28 15:32:44', NULL, 'Guest', 130.00, 13.00, 3.00, 140.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-28 07:32:44', '2025-03-28 07:32:44'),
('PG-13444', '2025-03-24 11:00:02', NULL, 'Eros', 130.00, 13.00, 0.00, 143.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-24 03:00:02', '2025-03-24 03:00:02'),
('PG-14075', '2025-03-22 14:06:40', NULL, 'Guest', 20.00, 2.00, 0.00, 22.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-22 06:06:40', '2025-03-22 06:06:40'),
('PG-14135', '2025-03-21 22:55:00', NULL, 'Guest', 130.00, 13.00, 0.00, 143.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-21 14:55:00', '2025-03-21 14:55:00'),
('PG-17322', '2025-03-24 11:28:35', NULL, 'Eros', 130.00, 13.00, 0.00, 143.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-24 03:28:35', '2025-03-24 03:28:35'),
('PG-19755', '2025-03-28 18:54:16', NULL, 'Guest', 390.00, 39.00, 0.00, 429.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-28 10:54:16', '2025-03-28 10:54:16'),
('PG-20005', '2025-03-28 19:29:36', NULL, 'Guest', 180.00, 18.00, 0.00, 198.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-28 11:29:36', '2025-03-28 11:29:36'),
('PG-20821', '2025-03-26 22:31:34', NULL, 'Guest', 130.00, 13.00, 0.00, 143.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-26 14:31:34', '2025-03-26 14:31:34'),
('PG-21510', '2025-03-24 22:34:39', NULL, 'Guest', 130.00, 13.00, 0.00, 143.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-24 14:34:39', '2025-03-24 14:34:39'),
('PG-32106', '2025-03-22 01:46:58', NULL, 'Guest', 50.00, 5.00, 5.00, 50.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-21 17:46:58', '2025-03-21 17:46:58'),
('PG-39224', '2025-03-30 16:32:48', NULL, 'Guest', 130.00, 13.00, 0.00, 143.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-30 08:32:48', '2025-03-30 08:32:48'),
('PG-42165', '2025-03-22 23:32:26', NULL, 'Guest', 15.00, 1.50, 0.00, 16.50, 'completed', NULL, '001', 'Admin User', '001', '2025-03-22 15:32:26', '2025-03-22 15:32:26'),
('PG-43489', '2025-03-28 17:59:10', NULL, 'Guest', 540.00, 54.00, 0.00, 594.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-28 09:59:10', '2025-03-28 09:59:10'),
('PG-43566', '2025-03-19 23:47:36', NULL, 'Guest', 50.00, 5.00, 0.00, 55.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-19 15:47:36', '2025-03-19 15:47:36'),
('PG-46943', '2025-03-28 19:15:30', NULL, 'Guest', 540.00, 54.00, 0.00, 594.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-28 11:15:30', '2025-03-28 11:15:30'),
('PG-49474', '2025-03-24 11:25:07', NULL, 'Guest', 130.00, 13.00, 0.00, 143.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-24 03:25:07', '2025-03-24 03:25:07'),
('PG-51186', '2025-03-29 17:31:47', NULL, 'Guest', 130.00, 13.00, 0.00, 143.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-29 09:31:47', '2025-03-29 09:31:47'),
('PG-52573', '2025-03-29 13:16:19', NULL, 'Aer', 260.00, 26.00, 0.00, 286.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-29 05:16:19', '2025-03-29 05:16:19'),
('PG-53159', '2025-03-31 08:54:06', NULL, 'Guest', 3780.00, 378.00, 0.00, 4158.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-31 00:54:06', '2025-03-31 00:54:06'),
('PG-56303', '2025-03-22 21:25:52', NULL, 'Guest', 20.00, 2.00, 0.00, 22.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-22 13:25:52', '2025-03-22 13:25:52'),
('PG-61343', '2025-03-23 21:41:37', NULL, 'Guest', 20.00, 2.00, 0.00, 22.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-23 13:41:37', '2025-03-23 13:41:37'),
('PG-62255', '2025-03-26 18:09:54', NULL, 'Guest', 1500.00, 150.00, 0.00, 1650.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-26 10:09:54', '2025-03-26 10:09:54'),
('PG-66254', '2025-03-19 21:00:53', NULL, 'Guest', 50.00, 5.00, 0.00, 55.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-19 13:00:53', '2025-03-19 13:00:53'),
('PG-71150', '2025-03-22 22:56:57', NULL, 'Guest', 20.00, 2.00, 0.00, 22.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-22 14:56:57', '2025-03-22 14:56:57'),
('PG-71397', '2025-03-31 08:43:25', NULL, 'Guest', 2730.00, 273.00, 20.00, 2983.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-31 00:43:25', '2025-03-31 00:43:25'),
('PG-72587', '2025-03-22 19:32:45', NULL, 'Guest', 10.00, 1.00, 0.00, 11.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-22 11:32:45', '2025-03-22 11:32:45'),
('PG-74398', '2025-03-28 18:51:57', NULL, 'Benchi', 130.00, 13.00, 0.00, 143.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-28 10:51:57', '2025-03-28 10:51:57'),
('PG-76607', '2025-03-22 13:11:05', NULL, 'Guest', 60.00, 6.00, 0.00, 66.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-22 05:11:05', '2025-03-22 05:11:05'),
('PG-81305', '2025-03-24 11:25:38', NULL, 'Guest', 180.00, 18.00, 0.00, 198.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-24 03:25:38', '2025-03-24 03:25:38'),
('PG-91308', '2025-03-24 23:27:26', NULL, 'Guest', 60.00, 6.00, 6.00, 60.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-24 15:27:26', '2025-03-24 15:27:26'),
('PG-91640', '2025-03-20 13:01:49', NULL, 'Guest', 300.00, 30.00, 0.00, 330.00, 'completed', NULL, '001', 'Admin User', '001', '2025-03-20 05:01:49', '2025-03-20 05:01:49'),
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
(54, 'PG-93675', 'P034', 'Piña Dishwashing Soap', 1.000, 60.00, 0.00, 0.00, 10.00, 6.00, 60.00, 66.00, '2025-04-12 07:18:49');

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
(39, 'PG-93675', 1, 121.00, NULL, '2025-04-12 15:18:49', 'completed', 0.00, NULL, '2025-04-12 07:18:49', '2025-04-12 07:18:49');

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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `product_id`, `product_photo`, `product_name`, `category`, `stocks`, `price`, `expiration_date`, `batch_tracking`, `status`, `created_at`, `updated_at`) VALUES
(116, 'P029', 'uploads/product_67e6e2d540455.png', 'Piña Bars', 'Snacks', 0, 130.00, '0000-00-00', 1, 'Out of Stock', '2025-03-28 17:56:37', '2025-03-31 00:43:25'),
(117, 'P030', 'uploads/product_67e6e2fd9095d.png', 'Piña Putoseko', 'Snacks', 31, 50.00, '0000-00-00', 1, 'In Stock', '2025-03-28 17:57:17', '2025-04-12 07:18:49'),
(118, 'P031', 'uploads/product_67e6e32751406.png', 'Piña Tuyo', 'Preserves', 19, 180.00, '2025-05-28', 1, 'Out of Stock', '2025-03-28 17:57:59', '2025-03-31 00:54:06'),
(119, 'P032', 'uploads/product_67e6e3427bccc.png', 'TinaPiña', 'Preserves', 20, 180.00, '0000-00-00', 1, 'Low Stock', '2025-03-28 17:58:26', '2025-03-28 17:58:26'),
(120, 'P033', 'uploads/product_67e6e36976974.png', 'Pineapple Concentrate', 'Preserves', 25, 130.00, '2025-05-28', 1, 'In Stock', '2025-03-28 17:59:05', '2025-04-09 07:06:18'),
(122, 'P034', 'uploads/product_67e77ea45ac5b.png', 'Piña Dishwashing Soap', 'Detergent', 9, 60.00, '0000-00-00', 0, 'In Stock', '2025-03-28 18:11:20', '2025-04-12 07:18:49'),
(123, 'P035', 'uploads/product_67e77e3c6f5f5.png', 'Piña Mangga Bars', 'Snacks', 29, 130.00, '0000-00-00', 1, 'In Stock', '2025-03-29 04:59:27', '2025-04-09 04:45:11'),
(124, 'P036', 'uploads/product_67e77e7b29715.png', 'Piña Tsokolate Bars', 'Snacks', 150, 130.00, '2025-05-29', 1, 'In Stock', '2025-03-29 05:00:03', '2025-04-12 06:57:14');

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
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_batches`
--

INSERT INTO `product_batches` (`batch_id`, `product_id`, `batch_code`, `quantity`, `expiration_date`, `manufacturing_date`, `unit_cost`, `created_at`, `updated_at`) VALUES
(136, 'P012', '20250324-218', 20, '2025-05-23', '2025-03-23', 0.00, '2025-03-24 04:44:26', '2025-03-24 04:44:26'),
(166, 'P021', '20250324-982', 30, '2025-05-24', '2025-03-24', 0.00, '2025-03-24 23:19:32', '2025-03-24 23:19:32'),
(169, 'P021', '20250324-849', 10, '2025-05-24', '2025-03-24', 0.00, '2025-03-24 23:36:34', '2025-03-24 23:36:34'),
(170, 'P021', '20250324-849', 10, '2025-05-24', '0000-00-00', 0.00, '2025-03-24 23:36:34', '2025-03-25 18:26:05'),
(171, 'P021', '20250324-849', 10, '2025-05-24', '2025-03-24', 0.00, '2025-03-24 23:36:34', '2025-03-24 23:36:34'),
(172, 'P021', '20250324-473', 52, '2025-05-24', '0000-00-00', 0.00, '2025-03-24 23:38:02', '2025-03-25 19:03:19'),
(174, 'P023', '20250324-125', 50, '2025-05-25', '0000-00-00', 0.00, '2025-03-24 23:39:59', '2025-03-25 19:01:42'),
(175, 'P023', '20250324-904', 20, '2025-05-25', '0000-00-00', 0.00, '2025-03-24 23:40:11', '2025-03-25 18:47:30'),
(176, 'P025', '20250324-015', 50, '2025-05-24', '2025-03-24', 0.00, '2025-03-24 23:41:44', '2025-03-24 23:41:44'),
(177, 'P023', '20250325-572', 15, '2025-05-25', '0000-00-00', 0.00, '2025-03-25 00:14:11', '2025-03-25 18:24:49'),
(178, 'P023', '20250325-762', 20, '2025-05-25', '0000-00-00', 0.00, '2025-03-25 17:59:47', '2025-03-25 18:19:53'),
(179, 'P023', '20250325-762', 21, '2025-05-25', '0000-00-00', 0.00, '2025-03-25 17:59:47', '2025-03-25 17:59:47'),
(180, 'P023', '20250325-695', 20, '2025-05-25', '0000-00-00', 0.00, '2025-03-25 18:32:43', '2025-03-25 18:32:43'),
(186, 'P021', '20250325-320', 100, '2025-05-25', '0000-00-00', 0.00, '2025-03-25 19:03:31', '2025-03-25 19:03:31'),
(188, 'P027', '20250325-309', 51, '2025-05-25', '0000-00-00', 0.00, '2025-03-25 19:26:33', '2025-03-25 22:15:21'),
(189, 'P027', '20250325-862', 30, '2025-05-25', '0000-00-00', 0.00, '2025-03-25 19:26:56', '2025-03-25 20:04:19'),
(190, 'P027', '20250325-862', 32, '2025-05-25', '0000-00-00', 0.00, '2025-03-25 19:26:56', '2025-03-25 20:18:22'),
(200, 'P027', '20250325-709', 10, '2025-05-25', '0000-00-00', 0.00, '2025-03-25 20:19:29', '2025-03-25 20:19:49'),
(203, 'P027', '20250325-305', 20, '2025-05-25', '0000-00-00', 0.00, '2025-03-25 23:17:55', '2025-03-25 23:17:55'),
(251, 'P029', '20250329-959', 0, '2025-05-28', '2025-03-28', 0.00, '2025-03-29 01:56:37', '2025-03-31 08:43:25'),
(252, 'P030', '20250329-563', 31, '2025-05-28', '2025-03-28', 0.00, '2025-03-29 01:57:17', '2025-04-12 15:18:49'),
(253, 'P031', '20250329-320', 0, '2025-05-28', '2025-03-28', 0.00, '2025-03-29 01:57:59', '2025-03-31 08:54:06'),
(254, 'P032', '20250329-196', 20, '2025-05-28', '2025-03-28', 0.00, '2025-03-29 01:58:26', '2025-03-29 01:58:26'),
(255, 'P033', '20250329-619', 5, '2025-05-28', '2025-03-28', 0.00, '2025-03-29 01:59:05', '2025-04-09 15:06:18'),
(256, 'P035', '20250329-514', 29, '2025-05-29', '2025-03-29', 0.00, '2025-03-29 12:59:27', '2025-04-09 12:45:11'),
(257, 'P036', '20250329-067', 45, '2025-05-29', '2025-03-29', 0.00, '2025-03-29 13:00:03', '2025-03-30 01:09:33'),
(258, 'P033', '20250329-408', 20, '2025-05-29', '0000-00-00', 0.00, '2025-03-29 23:06:02', '2025-03-29 23:06:02'),
(268, 'P031', '20250331-062', 19, '2025-05-31', '0000-00-00', 0.00, '2025-03-31 08:53:09', '2025-03-31 08:54:06'),
(269, 'P036', '20250411-703', 55, '2025-06-11', '0000-00-00', 0.00, '2025-04-11 20:00:00', '2025-04-11 20:00:00'),
(270, 'P036', '20250412-098', 50, '2025-06-12', '0000-00-00', 0.00, '2025-04-12 14:57:14', '2025-04-12 14:57:14');

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
  `status` enum('order','confirmed','shipped','delivered','cancelled') NOT NULL DEFAULT 'order',
  `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `tax` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `retailer_orders`
--

INSERT INTO `retailer_orders` (`order_id`, `po_number`, `retailer_name`, `retailer_email`, `retailer_contact`, `order_date`, `expected_delivery`, `status`, `subtotal`, `tax`, `discount`, `total_amount`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'RO-20250413-245', 'Van Clive', 'vanngaming2003@gmail.com', '+639749374734', '2025-04-13', '2025-04-29', '', 50.00, 6.00, 0.00, 56.00, '', '2025-04-13 15:56:09', '2025-04-13 15:56:09'),
(2, 'RO-20250413-945', 'Eighth Targaryen', 'eighthtargaryen@gmail.com', '+639746573957', '2025-04-14', '2025-04-29', '', 650.00, 78.00, 0.00, 728.00, '', '2025-04-13 16:13:39', '2025-04-13 16:13:39');

-- --------------------------------------------------------

--
-- Table structure for table `retailer_order_items`
--

CREATE TABLE `retailer_order_items` (
  `item_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `retailer_order_items`
--

INSERT INTO `retailer_order_items` (`item_id`, `order_id`, `product_id`, `quantity`, `unit_price`, `total_price`, `created_at`) VALUES
(1, 1, 0, 1, 50.00, 50.00, '2025-04-13 15:56:09'),
(2, 2, 0, 5, 130.00, 650.00, '2025-04-13 16:13:39');

-- --------------------------------------------------------

--
-- Table structure for table `retailer_order_status_history`
--

CREATE TABLE `retailer_order_status_history` (
  `history_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `status` enum('order','confirmed','shipped','delivered','cancelled') NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `retailer_order_status_history`
--

INSERT INTO `retailer_order_status_history` (`history_id`, `order_id`, `status`, `notes`, `created_at`) VALUES
(1, 1, 'order', '', '2025-04-13 15:56:09'),
(2, 2, 'order', '', '2025-04-13 16:13:39');

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
(13, 15, 'Turee', 'Targaryen', '2004-06-30', 20, 'Filipino', 'Turee store', '0', NULL, NULL, NULL, NULL, 'Dayap', 'Dayap', '+639876547896', NULL, 'Turee Targaryen', '', '', '2025-04-10 12:01:14', '2025-04-12 00:31:49'),
(14, 16, 'Jhovan', 'Magno', '2004-07-21', 20, 'Filipino', 'Vann', '0', NULL, NULL, NULL, NULL, 'Site 3', 'Site 3', '+639949407497', NULL, 'Jhovan Magno', '', '', '2025-04-10 12:35:38', '2025-04-12 00:31:49'),
(16, 18, 'Siex', 'Targaryen', '2004-11-09', 20, 'Filipino', 'Siexta', '0', NULL, NULL, NULL, NULL, '0', '0', '+6397463837465', '../uploads/profile_images/profile_18_1744364171.jpg', 'Siex Targaryen', '', '', '2025-04-11 06:27:58', '2025-04-12 00:31:49'),
(17, 19, 'Sevence', 'Targaryens', '2006-06-14', 18, 'Filipino', 'Sevencense', '0', NULL, NULL, NULL, NULL, '0', '0', '+639837483937', '../uploads/profile_images/profile_19_1744364105.jpg', 'Sevence Targaryen', '', '', '2025-04-11 06:37:38', '2025-04-12 00:31:49'),
(18, 20, 'Van', 'Clive', '2005-11-06', 19, 'Filipino', 'Vangame', '0', 'Laguna', 'Calauan', 'Dayap', 'site 3', '', 'site 3, Barangay Dayap, Calauan, Laguna', '+639749374734', NULL, 'Jhovan Magno', '', '', '2025-04-12 00:34:02', '2025-04-12 00:34:02');

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
  `verification_expires` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `email`, `full_name`, `created_at`, `last_login`, `is_active`, `email_verified`, `verification_token`, `verification_expires`) VALUES
(1, 'owneradmin', '$2y$10$YourSaltHere1234567890uVHkitL.s1rEpQRMGxlbGRuZXJwYXNzd29yZA', 'admin', 'admin@pinana.com', 'Admin User', '2025-03-20 14:01:08', NULL, 1, 0, NULL, NULL),
(2, 'businessadmin', '$2y$10$1krAKIufORu071I0LYvuAeoMl0f/FGNz/u7mNE8W3Vd6HwRDrqrfG', 'admin', 'pinanagourmet@gmail.com', 'Pinana Gourmet', '2025-03-20 15:43:46', '2025-04-13 05:47:41', 1, 1, NULL, NULL),
(6, 'tuh_lips', '$2y$10$HygrbeRk8vFTlKqU.9fXO.JAXkuKKywf.XwiKrwxvTlmtW/Rb4xt6', 'retailer', 'tuhtargaryen@gmail.com', 'Tuh Targaryen', '2025-04-10 08:43:10', NULL, 1, 0, '0ddfa665c07a8c7882bb31acd751607bd34cbd56472dd0fd1415c89f443e1693', '2025-04-11 14:32:19'),
(12, 'eighthqt', '$2y$10$5wdwPfO4etp3X.BJPOngk.noi4RjpVjeuNxKfKJNQkyQ7Qhx9OI0a', 'retailer', 'eighthtargaryen@gmail.com', 'Eighth Targaryen', '2025-04-10 11:42:52', '2025-04-13 11:34:28', 1, 1, NULL, '2025-04-11 15:24:11'),
(13, 'aeroizclive', '$2y$10$raQ4v4H1fafj/ShuBIXd5OlvbFta8JykeUExjiPm5xjoGESVzmMfO', 'retailer', 'aeroizclive@gmail.com', 'Aeroiz Clive', '2025-04-10 11:44:49', NULL, 1, 1, NULL, '2025-04-11 16:40:48'),
(15, 'tureeqt', '$2y$10$6c.mXtiwmIrHbR.YX.tADuysrrTG2LxmJy6Wd2P82utg0eCMRDk0i', 'retailer', 'tureetargaryen@gmail.com', 'Turee Targaryen', '2025-04-10 12:01:14', NULL, 1, 0, '3b5736191a7b56457a1e2f51c5c14e8e918330021eb80217c923e5909893e6c0', '2025-04-11 14:06:42'),
(16, 'Zorinn', '$2y$10$I1oZhwGu3KmPZZG7p4XIq.nxJHX1XgE7Yzr1Zv5t7OpgUxQFa3HVu', 'retailer', 'jhovanmagno74@gmail.com', 'Jhovan Magno', '2025-04-10 12:35:38', NULL, 1, 0, 'f55ab738836df551f056d4bfc8741b00ca0a440e00f1487db78285506a6ca521', '2025-04-11 14:40:24'),
(18, 'siexy', '$2y$10$tKBb.IVFCgadtbHkLz7COuMuFbUZJBQahTCShQDEucF/h5ZHlxIki', 'retailer', 'siextargaryen@gmail.com', 'Siex Targaryen', '2025-04-11 06:27:58', '2025-04-13 05:47:04', 1, 1, NULL, '2025-04-12 08:28:06'),
(19, 'se.vence', '$2y$10$0pO9fKMMA7ulLtndhjaLG.2L2HZAPQPpSHVy6VukiyCHjKb5PRPC2', 'retailer', 'sevencetargaryen@gmail.com', 'Sevence Targaryen', '2025-04-11 06:37:38', '2025-04-13 07:01:40', 1, 1, NULL, '2025-04-12 08:37:48'),
(20, 'aer_van', '$2y$10$sUNtRopRpymtZ7ujYZdOJeVAMXT3feX7DoRVHQEJnat/7DGRMdJfK', 'retailer', 'vanngaming2003@gmail.com', 'Van Clive', '2025-04-12 00:34:02', '2025-04-13 08:03:55', 1, 1, NULL, '2025-04-13 02:34:12');

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
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_product_id` (`product_id`),
  ADD KEY `idx_products_name` (`product_name`),
  ADD KEY `idx_products_expiration` (`expiration_date`);

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
-- Indexes for table `retailer_orders`
--
ALTER TABLE `retailer_orders`
  ADD PRIMARY KEY (`order_id`);

--
-- Indexes for table `retailer_order_items`
--
ALTER TABLE `retailer_order_items`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `fk_order_id` (`order_id`);

--
-- Indexes for table `retailer_order_status_history`
--
ALTER TABLE `retailer_order_status_history`
  ADD PRIMARY KEY (`history_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `retailer_profiles`
--
ALTER TABLE `retailer_profiles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

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
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT for table `order_status_history`
--
ALTER TABLE `order_status_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

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
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT for table `pos_transaction_payments`
--
ALTER TABLE `pos_transaction_payments`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `pos_transaction_refunds`
--
ALTER TABLE `pos_transaction_refunds`
  MODIFY `refund_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=142;

--
-- AUTO_INCREMENT for table `product_batches`
--
ALTER TABLE `product_batches`
  MODIFY `batch_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=271;

--
-- AUTO_INCREMENT for table `retailer_orders`
--
ALTER TABLE `retailer_orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `retailer_order_items`
--
ALTER TABLE `retailer_order_items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `retailer_order_status_history`
--
ALTER TABLE `retailer_order_status_history`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `retailer_profiles`
--
ALTER TABLE `retailer_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

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
-- Constraints for table `retailer_order_items`
--
ALTER TABLE `retailer_order_items`
  ADD CONSTRAINT `fk_order_id` FOREIGN KEY (`order_id`) REFERENCES `retailer_orders` (`order_id`) ON DELETE CASCADE;

--
-- Constraints for table `retailer_order_status_history`
--
ALTER TABLE `retailer_order_status_history`
  ADD CONSTRAINT `retailer_order_status_history_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `retailer_orders` (`order_id`) ON DELETE CASCADE;

--
-- Constraints for table `retailer_profiles`
--
ALTER TABLE `retailer_profiles`
  ADD CONSTRAINT `retailer_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
