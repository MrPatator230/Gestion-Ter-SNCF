-- MySQL schema for storing entreprise page data

CREATE TABLE entreprise_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    company_slogan VARCHAR(255) NOT NULL,
    company_description TEXT NOT NULL,
    primary_color CHAR(7) NOT NULL, -- e.g. #RRGGBB
    secondary_color CHAR(7) NOT NULL,
    accent_color CHAR(7) NOT NULL,
    app_name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(512),
    favicon_url VARCHAR(512),
    font_family VARCHAR(100),
    button_style VARCHAR(50),
    header_style VARCHAR(50),
    footer_content TEXT,
    custom_css TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE footer_regions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entreprise_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    link VARCHAR(512) NOT NULL,
    FOREIGN KEY (entreprise_id) REFERENCES entreprise_settings(id) ON DELETE CASCADE
);

CREATE TABLE train_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entreprise_id INT NOT NULL,
    type_name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(512),
    FOREIGN KEY (entreprise_id) REFERENCES entreprise_settings(id) ON DELETE CASCADE
);

CREATE TABLE stations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE station_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    station_id INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);

CREATE TABLE materiels_roulants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL,
  image_data LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE ticket_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE schedule_folders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  train_number VARCHAR(255) NOT NULL,
  departure_station VARCHAR(255) NOT NULL,
  arrival_station VARCHAR(255) NOT NULL,
  arrival_time TIME NOT NULL,
  departure_time TIME NOT NULL,
  train_type VARCHAR(255) NOT NULL,
  rolling_stock_file_name VARCHAR(255),
  composition JSON,
  jours_circulation JSON,
  served_stations JSON,
  delay_minutes INT DEFAULT 0,
  is_cancelled BOOLEAN DEFAULT FALSE,
  track_assignments JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE schedule_folder_map (
  schedule_id INT NOT NULL,
  folder_id INT NOT NULL,
  PRIMARY KEY (schedule_id),
  FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
  FOREIGN KEY (folder_id) REFERENCES schedule_folders(id) ON DELETE CASCADE
);

CREATE TABLE login (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'client') NOT NULL DEFAULT 'client',
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
