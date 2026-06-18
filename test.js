const getCoordinates = require("./utils/geocoder");

(async () => {
    const result = await getCoordinates("Udupi");
    console.log(result);
})();