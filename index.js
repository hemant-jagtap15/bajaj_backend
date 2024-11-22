const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const userId = process.env.USER_ID;
const email = process.env.EMAIL;
const rollNumber = process.env.ROLL_NUMBER;

app.use(bodyParser.json());

// Helper Functions
const isPrime = (num) => {
  if (num <= 1) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
};

const validateFile = (base64String) => {
  if (!base64String) return { valid: false, mimeType: null, size: 0 };
  try {
    const buffer = Buffer.from(base64String, "base64");
    const sizeInKB = buffer.length / 1024;
    const mimeType = "application/octet-stream"; // Adjust logic for actual file type detection
    return { valid: true, mimeType, size: sizeInKB };
  } catch (error) {
    return { valid: false, mimeType: null, size: 0 };
  }
};

// POST Endpoint
app.post("/bfhl", (req, res) => {
  const { data, file_b64 } = req.body;

  // Input validation
  if (!data || !Array.isArray(data)) {
    return res
      .status(400)
      .json({ is_success: false, message: "Invalid input" });
  }

  // Extracting numbers and alphabets
  const numbers = data.filter((item) => /^[0-9]+$/.test(item));
  const alphabets = data.filter((item) => /^[a-zA-Z]$/.test(item));

  // Identify highest lowercase alphabet
  const lowercaseAlphabets = alphabets.filter((item) => /^[a-z]$/.test(item));
  const highestLowercase =
    lowercaseAlphabets.length > 0 ? lowercaseAlphabets.sort().pop() : null;

  // Check if any prime number exists
  const primeExists = numbers.some((num) => isPrime(Number(num)));

  // Validate file
  const fileValidation = validateFile(file_b64);

  // Construct response
  const response = {
    is_success: true,
    user_id: userId,
    email: email,
    roll_number: rollNumber,
    numbers,
    alphabets,
    highest_lowercase_alphabet: highestLowercase ? [highestLowercase] : [],
    is_prime_found: primeExists,
    file_valid: fileValidation.valid,
    file_mime_type: fileValidation.mimeType,
    file_size_kb: fileValidation.size.toFixed(2),
  };

  res.json(response);
});

// GET Endpoint
app.get("/bfhl", (req, res) => {
  res.status(200).json({ operation_code: 1 });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
