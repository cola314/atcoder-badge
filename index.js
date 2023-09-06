const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3000;
const ATCODER_API_BASE_URL = "https://atcoder.jp/users/";
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 3600 }); // Cache data for 1 hour (adjust as needed)

const ratingInfo = [
  {
    min: 2800,
    max: 4999,
    color: "#FF0000", // Red
    name: "Red",
  },
  {
    min: 2400,
    max: 2799,
    color: "#FFA500", // Orange
    name: "Orange",
  },
  {
    min: 2000,
    max: 2399,
    color: "#FFFF00", // Yellow
    name: "Yellow",
  },
  {
    min: 1600,
    max: 1999,
    color: "#0000FF", // Blue
    name: "Blue",
  },
  {
    min: 1200,
    max: 1599,
    color: "#00FFFF", // Cyan
    name: "Cyan",
  },
  {
    min: 800,
    max: 1199,
    color: "#008000", // Green
    name: "Green",
  },
  {
    min: 400,
    max: 799,
    color: "#A52A2A", // Brown
    name: "Brown",
  },
  {
    min: 0,
    max: 399,
    color: "#808080", // Gray
    name: "Gray",
  },
  {
    min: 0,
    max: 0,
    color: "#000000", // Silver
    name: "Black",
  },
];

function getMaxAndLatestRating(data) {
  let maxRating = -Infinity;
  let latestTime = -1;
  let latestRating = -1;

  for (const contest of data) {
    const newRating = contest.NewRating;
    if (newRating > maxRating) {
      maxRating = newRating;
    }
    const endTime = new Date(contest.EndTime);
    if (endTime > latestTime) {
      latestTime = endTime;
      latestRating = newRating;
    }
  }

  return { maxRating, latestRating };
}

app.get("/", (req, res) => {
  const userId = req.query.id;

  if (!userId) {
    return res.status(400).json({ error: "Missing user-id parameter" });
  }

  // Check if data is already cached
  const cachedData = cache.get(userId);
  if (cachedData) {
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.send(cachedData);
  }

  axios
    .get(`${ATCODER_API_BASE_URL}${userId}/history/json`)
    .then((response) => {
      const data = response.data;
      const { maxRating, latestRating } = getMaxAndLatestRating(data);
      let rating = getRatingInfo(latestRating);
      console.log(rating);
      let topRatingInfo = getRatingInfo(maxRating);
      console.log(maxRating);
      console.log(topRatingInfo);

      res.setHeader("Content-Type", "image/svg+xml");
      res.setHeader("Cache-Control", "public, max-age=3600");

      const svgData = svgDataForGeneralRating(
        rating,
        topRatingInfo,
        userId,
        maxRating,
        latestRating
      );
  
      // Cache the SVG data for this user ID
      cache.set(userId, svgData);
  
      res.send(svgData);
    })
    .catch((error) => {
      console.error("Error fetching data from AtCoder API:", error);
      res.status(500).json({ error: "Internal Server Error" });
    });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const svgDataForGeneralRating = (
  rating,
  topRatingInfo,
  userId,
  maxRating,
  latestRating
) => {
  const color = rating.color;
  const name = rating.name;
  const max = rating.max;
  const min = rating.min;
  const percentage = (latestRating - min) / (max - min);
  const str = `
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="350" height="131" viewBox="0 0 350 131">
    <defs>
    <clipPath id="clip-맞춤형_크기_39">
    <rect width="350" height="131"/>
    </clipPath>
    </defs>
    <g id="맞춤형_크기_39" data-name="맞춤형 크기 – 39" clip-path="url(#clip-맞춤형_크기_39)">
    <rect id="CONTAINER" width="344" height="121" rx="20" transform="translate(3 5)" fill="#36393f"/>
    <g id="name_bar" data-name="name &amp; bar" transform="translate(0 15)">
    <text id="USER_ID" transform="translate(330 15)" fill="${color}" font-size="1.8em" font-family="SegoeUI-Bold, Segoe UI, system-ui, -apple-system" font-weight="700" text-anchor="end"><tspan x="0" y="28">${userId}</tspan></text>
    <text id="USER_RANK" transform="translate(18 15)" fill="${color}" font-size="1em" font-family="SegoeUI-Bold, Segoe UI, system-ui, -apple-system" font-weight="700"><tspan x="0" y="0">${name}</tspan></text>
    <rect id="EXP_BAR" width="315" height="6" transform="translate(18 56)" fill="#707070"/>
    <rect id="CUR_EXP_BAR" width="${
      percentage * 315
    }" height="6" transform="translate(18 56)" fill="${color}"/>
    <text id="CUR_EXP" transform="translate(${
      percentage * 315 + 16
    } 73)" fill="${color}" font-size="0.75em" font-family="SegoeUI-Bold, Segoe UI, system-ui, -apple-system" font-weight="700"><tspan x="-12" y="0">${latestRating}</tspan></text>
    <text id="MAX_EXP" transform="translate(306 73)" fill="${color}" font-size="0.75em" font-family="SegoeUI-Bold, Segoe UI, system-ui, -apple-system" font-weight="700"><tspan x="0" y="0">${
    percentage * 315 + 16 >= 288 ? "" : max
  }</tspan></text>
    </g>
    <g id="max" transform="translate(-8 -18.573)">
    <text id="top_rating" transform="translate(26 132.573)" fill="#fff" font-size="0.78em" font-family="SegoeUI-Semibold, Segoe UI, system-ui, -apple-system" font-weight="600"><tspan x="0" y="0">top rating</tspan></text>
    <text id="max_rank" transform="translate(26 118.573)" fill="#fff" font-size="0.78em" font-family="SegoeUI-Semibold, Segoe UI, system-ui, -apple-system" font-weight="600"><tspan x="0" y="0">max rank</tspan></text>
    ${`<text id="cur_mak_rank" transform="translate(100 105.573)" fill="${topRatingInfo.color}" font-size="0.78em" font-family="SegoeUI-Bold, Segoe UI, system-ui, -apple-system" font-weight="700"><tspan y="13">${topRatingInfo.name}</tspan></text>`}
    <text id="cur_top_rating" transform="translate(100 120.573)" fill="${
      topRatingInfo.color
    }" font-size="0.78em" font-family="SegoeUI-Bold, Segoe UI, system-ui, -apple-system" font-weight="700"><tspan x="0" y="13">${maxRating}</tspan></text>
    </g>
    </g>
    </svg>
    
      `;
  return str;
};
function getRatingInfo(latestRating) {
  let rating;
  for (let i = 0; i < ratingInfo.length; i++) {
    if (
      ratingInfo[i].min <= latestRating &&
      latestRating <= ratingInfo[i].max
    ) {
      rating = ratingInfo[i];
    }
  }
  return rating;
}
