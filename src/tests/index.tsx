/* c8 ignore start */
try {
  await import("./client");
  console.log("Tests successful");
} catch (error) {
  console.error(error);
  if (typeof process !== "undefined") {
    process.exit(1);
  }
  throw error;
}

export default 1;
