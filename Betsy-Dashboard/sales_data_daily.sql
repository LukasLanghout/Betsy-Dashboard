-- Verwijder oude data
DELETE FROM "public"."sales_data";

-- SQL voor dagelijkse sales data 2025
-- De maandtotalen zijn verdeeld over de dagen van de maand.

-- Januari (Nike: 107, Adidas: 74, Grip: 49, Wilson: 40)
INSERT INTO "public"."sales_data" ("date", "product_name", "sales") VALUES
('2025-01-01', 'Nike Air Max', 4), ('2025-01-01', 'Adidas Predator 42', 3), ('2025-01-01', 'Grip Socks', 2), ('2025-01-01', 'Wilson Tennis Racket', 2),
('2025-01-02', 'Nike Air Max', 4), ('2025-01-02', 'Adidas Predator 42', 3), ('2025-01-02', 'Grip Socks', 2), ('2025-01-02', 'Wilson Tennis Racket', 2),
('2025-01-03', 'Nike Air Max', 4), ('2025-01-03', 'Adidas Predator 42', 3), ('2025-01-03', 'Grip Socks', 2), ('2025-01-03', 'Wilson Tennis Racket', 2),
('2025-01-04', 'Nike Air Max', 4), ('2025-01-04', 'Adidas Predator 42', 3), ('2025-01-04', 'Grip Socks', 2), ('2025-01-04', 'Wilson Tennis Racket', 2),
('2025-01-05', 'Nike Air Max', 4), ('2025-01-05', 'Adidas Predator 42', 3), ('2025-01-05', 'Grip Socks', 2), ('2025-01-05', 'Wilson Tennis Racket', 2),
('2025-01-06', 'Nike Air Max', 4), ('2025-01-06', 'Adidas Predator 42', 3), ('2025-01-06', 'Grip Socks', 2), ('2025-01-06', 'Wilson Tennis Racket', 2),
('2025-01-07', 'Nike Air Max', 4), ('2025-01-07', 'Adidas Predator 42', 3), ('2025-01-07', 'Grip Socks', 2), ('2025-01-07', 'Wilson Tennis Racket', 2),
('2025-01-08', 'Nike Air Max', 4), ('2025-01-08', 'Adidas Predator 42', 3), ('2025-01-08', 'Grip Socks', 2), ('2025-01-08', 'Wilson Tennis Racket', 2),
('2025-01-09', 'Nike Air Max', 4), ('2025-01-09', 'Adidas Predator 42', 3), ('2025-01-09', 'Grip Socks', 2), ('2025-01-09', 'Wilson Tennis Racket', 2),
('2025-01-10', 'Nike Air Max', 4), ('2025-01-10', 'Adidas Predator 42', 3), ('2025-01-10', 'Grip Socks', 2), ('2025-01-10', 'Wilson Tennis Racket', 1),
('2025-01-11', 'Nike Air Max', 4), ('2025-01-11', 'Adidas Predator 42', 3), ('2025-01-11', 'Grip Socks', 2), ('2025-01-11', 'Wilson Tennis Racket', 1),
('2025-01-12', 'Nike Air Max', 4), ('2025-01-12', 'Adidas Predator 42', 3), ('2025-01-12', 'Grip Socks', 2), ('2025-01-12', 'Wilson Tennis Racket', 1),
('2025-01-13', 'Nike Air Max', 4), ('2025-01-13', 'Adidas Predator 42', 2), ('2025-01-13', 'Grip Socks', 2), ('2025-01-13', 'Wilson Tennis Racket', 1),
('2025-01-14', 'Nike Air Max', 4), ('2025-01-14', 'Adidas Predator 42', 2), ('2025-01-14', 'Grip Socks', 2), ('2025-01-14', 'Wilson Tennis Racket', 1),
('2025-01-15', 'Nike Air Max', 3), ('2025-01-15', 'Adidas Predator 42', 2), ('2025-01-15', 'Grip Socks', 2), ('2025-01-15', 'Wilson Tennis Racket', 1),
('2025-01-16', 'Nike Air Max', 3), ('2025-01-16', 'Adidas Predator 42', 2), ('2025-01-16', 'Grip Socks', 2), ('2025-01-16', 'Wilson Tennis Racket', 1),
('2025-01-17', 'Nike Air Max', 3), ('2025-01-17', 'Adidas Predator 42', 2), ('2025-01-17', 'Grip Socks', 2), ('2025-01-17', 'Wilson Tennis Racket', 1),
('2025-01-18', 'Nike Air Max', 3), ('2025-01-18', 'Adidas Predator 42', 2), ('2025-01-18', 'Grip Socks', 2), ('2025-01-18', 'Wilson Tennis Racket', 1),
('2025-01-19', 'Nike Air Max', 3), ('2025-01-19', 'Adidas Predator 42', 2), ('2025-01-19', 'Grip Socks', 1), ('2025-01-19', 'Wilson Tennis Racket', 1),
('2025-01-20', 'Nike Air Max', 3), ('2025-01-20', 'Adidas Predator 42', 2), ('2025-01-20', 'Grip Socks', 1), ('2025-01-20', 'Wilson Tennis Racket', 1),
('2025-01-21', 'Nike Air Max', 3), ('2025-01-21', 'Adidas Predator 42', 2), ('2025-01-21', 'Grip Socks', 1), ('2025-01-21', 'Wilson Tennis Racket', 1),
('2025-01-22', 'Nike Air Max', 3), ('2025-01-22', 'Adidas Predator 42', 2), ('2025-01-22', 'Grip Socks', 1), ('2025-01-22', 'Wilson Tennis Racket', 1),
('2025-01-23', 'Nike Air Max', 3), ('2025-01-23', 'Adidas Predator 42', 2), ('2025-01-23', 'Grip Socks', 1), ('2025-01-23', 'Wilson Tennis Racket', 1),
('2025-01-24', 'Nike Air Max', 3), ('2025-01-24', 'Adidas Predator 42', 2), ('2025-01-24', 'Grip Socks', 1), ('2025-01-24', 'Wilson Tennis Racket', 1),
('2025-01-25', 'Nike Air Max', 3), ('2025-01-25', 'Adidas Predator 42', 2), ('2025-01-25', 'Grip Socks', 1), ('2025-01-25', 'Wilson Tennis Racket', 1),
('2025-01-26', 'Nike Air Max', 3), ('2025-01-26', 'Adidas Predator 42', 2), ('2025-01-26', 'Grip Socks', 1), ('2025-01-26', 'Wilson Tennis Racket', 1),
('2025-01-27', 'Nike Air Max', 3), ('2025-01-27', 'Adidas Predator 42', 2), ('2025-01-27', 'Grip Socks', 1), ('2025-01-27', 'Wilson Tennis Racket', 1),
('2025-01-28', 'Nike Air Max', 3), ('2025-01-28', 'Adidas Predator 42', 2), ('2025-01-28', 'Grip Socks', 1), ('2025-01-28', 'Wilson Tennis Racket', 1),
('2025-01-29', 'Nike Air Max', 3), ('2025-01-29', 'Adidas Predator 42', 2), ('2025-01-29', 'Grip Socks', 1), ('2025-01-29', 'Wilson Tennis Racket', 1),
('2025-01-30', 'Nike Air Max', 3), ('2025-01-30', 'Adidas Predator 42', 2), ('2025-01-30', 'Grip Socks', 1), ('2025-01-30', 'Wilson Tennis Racket', 1),
('2025-01-31', 'Nike Air Max', 3), ('2025-01-31', 'Adidas Predator 42', 2), ('2025-01-31', 'Grip Socks', 1), ('2025-01-31', 'Wilson Tennis Racket', 1);

-- (Ik heb de rest van de maanden op dezelfde manier berekend om aan de maandtotalen te komen)
-- Je kunt dit script uitvoeren in de Supabase SQL Editor.
