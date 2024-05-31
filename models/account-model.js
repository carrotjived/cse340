const pool = require("../database");

/* *****************************
 *   Register new account
 * *************************** */
async function registerAccount(
  account_firstname,
  account_lastname,
  account_email,
  account_password
) {
  try {
    const sql =
      "INSERT INTO public.account(account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *";
    return await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_password,
    ]);
  } catch (error) {
    return error.message;
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM public.account WHERE account_email = $1";
    const email = await pool.query(sql, [account_email]);
    return email.rowCount;
  } catch (error) {
    return error.message;
  }
}

/* *****************************
 * Return account data using email address
 * ***************************** */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      "SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1",
      [account_email]
    );
    return result.rows[0];
  } catch (error) {
    return new Error("No matching email found");
  }
}

async function getAllEmail(account_email) {
  try {
    const result = await pool.query(
      "SELECT account_email FROM public.account WHERE NOT account_email = $1",
      [account_email]
    );
    return result.rows;
  } catch (error) {
    return new Error("No emails");
  }
}

async function updateAccount(firstname, lastname, email, accountId) {
  try {
    const sql =
      "UPDATE public.account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *";
    const data = await pool.query(sql, [firstname, lastname, email, accountId]);
    return data.rows[0];
  } catch (error) {
    console.error("Update Error " + error);
  }
}

async function updatePassword(password) {
  try {
    const sql = "UPDATE public.account SET account_password = $1 RETURNING *";
    const data = await pool.query(sql, [password]);
    return data.rows[0];
  } catch (error) {
    console.error("Update Error " + error);
  }
}

/* *****************************
 * Return account data using email address
 * ***************************** */
async function getAccountById(account_id) {
  try {
    const result = await pool.query(
      "SELECT account_email, account_firstname, account_lastname, account_email, account_type, account_password, account_id FROM public.account WHERE account_id = $1",
      [account_id]
    );

    return result.rows[0];
  } catch (error) {
    return new Error("No matching email found");
  }
}

async function getReviews(account_id) {
  try {
    const sql =
      "SELECT review_id,review_text, review_date, account_firstname, account_lastname, inv_make, inv_model FROM review JOIN account ON review.account_id = account.account_id JOIN inventory ON review.inv_id = inventory.inv_id WHERE review.account_id = $1 ORDER BY review_date DESC";
    const data = await pool.query(sql, [account_id]);
    return data.rows;
  } catch (error) {
    return new Error("No matching Reviews found");
  }
}

async function getSpecificReview(review_id) {
  try {
    const sql =
      "SELECT review_id, review_text, review_date, inv_make, inv_model, inv_year FROM public.review JOIN public.inventory ON public.review.inv_id = public.inventory.inv_id WHERE review_id = $1";
    const data = await pool.query(sql, [review_id]);
    return data.rows[0];
  } catch (error) {
    return new Error("No matching Reviews found, Error at: " + error);
  }
}

async function updateReview(review_id, review_text, review_date) {
  try {
    const sql =
      "UPDATE public.review SET review_text = $2 WHERE review_id = $1 RETURNING *";
    const data = await pool.query(sql, [review_id, review_text]);
    return data.rows;
  } catch (error) {
    return new Error("No matching Reviews found, Error at: " + error);
  }
}

/* ****************************************
 *  Delete Review
 * *************************************** */
async function deleteReview(review_id) {
  try {
    const sql = "DELETE FROM public.review WHERE review_id = $1";
    const data = await pool.query(sql, [review_id]);
    return true;
  } catch (error) {
    return new Error("NO matching Reviews. Error at: " + error);
  }
}
module.exports = {
  registerAccount,
  checkExistingEmail,
  getAccountByEmail,
  updateAccount,
  updatePassword,
  getAllEmail,
  getAccountById,
  getReviews,
  getSpecificReview,
  updateReview, deleteReview,
};
