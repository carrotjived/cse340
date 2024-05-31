const pool = require("../database");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  return await pool.query(
    "SELECT * FROM public.classification ORDER BY classification_name"
  );
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getclassificationsbyid error " + error);
  }
}
/* ***************************
 *  Get inventory data by inventory id
 * ************************** */
async function getInventoryByInventoryId(inventory_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i WHERE i.inv_id = $1`,
      [inventory_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getinventorybyid error " + error);
  }
}

/* ***************************
 *  Add Classificaiton to Database
 * ************************** */

async function addClassification(classification_name) {
  try {
    const sql =
      "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *";
    return await pool.query(sql, [classification_name]);
  } catch (error) {
    return error.message;
  }
}

/* ***************************
 *  Add New Vehicle to Database Function
 * ************************** */
async function addInventory(
  inv_make,
  inv_model,
  inv_year,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql =
      "INSERT INTO public.inventory (inv_make,inv_model,inv_year,inv_description,inv_image,inv_thumbnail,inv_price,inv_miles,inv_color,classification_id) Values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *";
    return await pool.query(sql, [
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    ]);
  } catch (error) {
    return error.message;
  }
}
/* ***************************
 *  Update Vehicle to Database Function
 * ************************** */
async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING * ";
    const data = await pool.query(sql, [
      inv_make, //1
      inv_model, //2
      inv_description, //3
      inv_image, //4
      inv_thumbnail, //5
      inv_price, //6
      inv_year, //7
      inv_miles, //8
      inv_color, //9
      classification_id, //10
      inv_id, //11
    ]);
    return data.rows[0];
  } catch (error) {
    console.error("model error: " + error);
  }
}

/* ***************************
 *  Delete Vehicle to Database Function
 * ************************** */
async function deleteInventory(inv_id) {
  try {
    const sql = "DELETE FROM public.inventory WHERE inv_id = $1";
    const data = await pool.query(sql, [inv_id]);
    return data;
  } catch (error) {
    console.error("Delete Inventory Error: " + error);
  }
}

/* **************************************
 * Get Reviews from database
 * ************************************ */
async function getReviews(inv_id) {
  try {
    const sql = 'SELECT review_text, review_date, account_firstname, account_lastname FROM review JOIN account ON review.account_id = account.account_id WHERE review.inv_id = $1 ORDER BY review_date DESC';
    const data = await pool.query(sql, [inv_id]);
    return data.rows;
  } catch (error) {
    console.error("Get Review Error: " + error);
  }
}

async function getReviewsPerVehicle(inv_id){
  try {
    const sql = 
    "SELECT * FROM public.review WHERE inv_id = $1";
    const data = await pool.query(sql, [inv_id])
    return data.rows;
  } catch (error){
    console.error("Get Review Error")
  }
}
/* ************************
 * Post New Reviews
 ************************** */
async function addNewReview(review_text, account_id, inv_id) {
  try {
    const sql =
      "INSERT INTO public.review (review_text, account_id, inv_id) VALUES ($1, $2, $3)";
    const data = await pool.query(sql, [review_text, account_id, inv_id]);
    return data.rows;
  } catch (error) {
    console.error("Add Review Error: " + error);
  }
}
module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryByInventoryId,
  addClassification,
  addInventory,
  updateInventory,
  deleteInventory,
  getReviews,
  addNewReview, getReviewsPerVehicle,
};
