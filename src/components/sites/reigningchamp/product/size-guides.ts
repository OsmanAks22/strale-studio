/**
 * "How to measure" slides from the source size-guide drawer (Shopify metaobjects), keyed by the
 * measurement labels used in the snapshot. Item figures differ by garment family.
 */
export type MeasureSlide = { image: string; title: string; text: string };

export const BODY_SLIDES: Record<string, MeasureSlide> = {
  "chest": {
    "image": "https://reigningchamp.com/cdn/shop/files/RC_how_to_measure_body_chest.jpg?v=1739394270",
    "title": "CHEST",
    "text": "Measure around the widest part of your chest, under your armpits, and across your back."
  },
  "shoulder": {
    "image": "https://reigningchamp.com/cdn/shop/files/RC_how_to_measure_body_shoulder.jpg?v=1739394271",
    "title": "SHOULDER",
    "text": "Measure from one shoulder bone to the other across your back."
  },
  "neck": {
    "image": "https://reigningchamp.com/cdn/shop/files/RC_how_to_measure_body_neck.jpg?v=1739394270",
    "title": "NECK",
    "text": "Measure around the base of your neck where a shirt collar would sit."
  },
  "waist": {
    "image": "https://reigningchamp.com/cdn/shop/files/RC_how_to_measure_body_waist.jpg?v=1739394271",
    "title": "WAIST",
    "text": "Stand relaxed and find for the narrowest part of your torso, then measure."
  },
  "hip": {
    "image": "https://reigningchamp.com/cdn/shop/files/RC_how_to_measure_body_hip.jpg?v=1739394270",
    "title": "HIP",
    "text": "Stand with feet together, measure around the fullest part of your hips."
  },
  "inseam": {
    "image": "https://reigningchamp.com/cdn/shop/files/RC_how_to_measure_body_inseam.jpg?v=1739394270",
    "title": "INSEAM",
    "text": "Stand with legs slightly apart, measure from the top of your inner thigh to the ankle."
  }
};

export const ITEM_SLIDES: Record<string, Record<string, MeasureSlide>> = {
  "L-SLEEVE": {
    "shoulder width": {
      "image": "https://reigningchamp.com/cdn/shop/files/RC_SIZE_GUIDE_L-SLEEVE_SHOULDER.jpg?v=1723228079",
      "title": "SHOULDER WIDTH",
      "text": "Measure from the top of one sleeve (at the shoulder) to the other."
    },
    "chest width": {
      "image": "https://reigningchamp.com/cdn/shop/files/RC_SIZE_GUIDE_L-SLEEVE_CHEST.jpg?v=1723228079",
      "title": "CHEST WIDTH",
      "text": "Measure across the chest from one side of the item to the other, one inch below the armpit."
    },
    "body length": {
      "image": "https://reigningchamp.com/cdn/shop/files/RC_SIZE_GUIDE_L-SLEEVE_BODY.jpg?v=1723228079",
      "title": "BODY LENGTH",
      "text": "Measure from the highest point on the shoulder seam (next to the collar) straight down to the bottom of the item."
    },
    "sleeve length": {
      "image": "https://reigningchamp.com/cdn/shop/files/RC_SIZE_GUIDE_L-SLEEVE_SLEEVE.jpg?v=1723228080",
      "title": "SLEEVE LENGTH",
      "text": "Measure from the top of the sleeve (at the shoulder) to the end of the sleeve."
    }
  },
  "JACKET": {
    "shoulder width": {
      "image": "https://reigningchamp.com/cdn/shop/files/RC_SIZE_GUIDE_JACKET_SHOULDER.jpg?v=1723228080",
      "title": "SHOULDER WIDTH",
      "text": "Measure from the top of one sleeve (at the shoulder) to the other."
    },
    "chest width": {
      "image": "https://reigningchamp.com/cdn/shop/files/RC_SIZE_GUIDE_JACKET_CHEST.jpg?v=1723228078",
      "title": "CHEST WIDTH",
      "text": "Measure across the chest from one side of the item to the other, one inch below the armpit."
    },
    "body length": {
      "image": "https://reigningchamp.com/cdn/shop/files/RC_SIZE_GUIDE_JACKET_BODY.jpg?v=1723228078",
      "title": "BODY LENGTH",
      "text": "Measure from the highest point on the shoulder seam (next to the collar) straight down to the bottom of the item."
    },
    "sleeve length": {
      "image": "https://reigningchamp.com/cdn/shop/files/RC_SIZE_GUIDE_JACKET_SLEEVE.jpg?v=1723228079",
      "title": "SLEEVE LENGTH",
      "text": "Measure from the top of the sleeve (at the shoulder) to the end of the sleeve."
    }
  },
  "S-SLEEVE": {
    "shoulder width": {
      "image": "https://reigningchamp.com/cdn/shop/files/RC_SIZE_GUIDE_S-SLEEVE_SHOULDER.jpg?v=1723228083",
      "title": "SHOULDER WIDTH",
      "text": "Measure from the top of one sleeve (at the shoulder) to the other."
    },
    "chest width": {
      "image": "https://reigningchamp.com/cdn/shop/files/RC_SIZE_GUIDE_S-SLEEVE_CHEST.jpg?v=1723228082",
      "title": "CHEST WIDTH",
      "text": "Measure across the chest from one side of the item to the other, one inch below the armpit."
    },
    "body length": {
      "image": "https://reigningchamp.com/cdn/shop/files/RC_SIZE_GUIDE_S-SLEEVE_BODY.jpg?v=1723228082",
      "title": "BODY LENGTH",
      "text": "Measure from the highest point on the shoulder seam (next to the collar) straight down to the bottom of the item."
    },
    "sleeve length": {
      "image": "https://reigningchamp.com/cdn/shop/files/RC_SIZE_GUIDE_S-SLEEVE_SLEEVE.jpg?v=1723228082",
      "title": "SLEEVE LENGTH",
      "text": "Measure from the top of the sleeve (at the shoulder) to the end of the sleeve."
    }
  },
  "LS_SHIRT": {
    "neck": {
      "image": "https://reigningchamp.com/cdn/shop/files/RC_SIZE_GUIDE_LS_SHIRT_NECK.jpg?v=1723228080",
      "title": "NECK",
      "text": "Measure from the highest point of one shoulder seam (next to the collar) to the other."
    },
    "shoulder width": {
      "image": "https://reigningchamp.com/cdn/shop/files/RC_SIZE_GUIDE_LS_SHIRT_SHOULDER.jpg?v=1723228081",
      "title": "SHOULDER WIDTH",
      "text": "Measure from the top of one sleeve (at the shoulder) to the other."
    },
    "chest width": {
      "image": "https://reigningchamp.com/cdn/shop/files/RC_SIZE_GUIDE_LS_SHIRT_CHEST.jpg?v=1723228080",
      "title": "CHEST WIDTH",
      "text": "Measure across the chest from one side of the item to the other, one inch below the armpit."
    },
    "body length": {
      "image": "https://reigningchamp.com/cdn/shop/files/RC_SIZE_GUIDE_LS_SHIRT_BODY.jpg?v=1723228080",
      "title": "BODY LENGTH",
      "text": "Measure from the highest point on the shoulder seam (next to the collar) straight down to the bottom of the item."
    },
    "sleeve length": {
      "image": "https://reigningchamp.com/cdn/shop/files/RC_SIZE_GUIDE_LS_SHIRT_SLEEVE.jpg?v=1723228081",
      "title": "SLEEVE LENGTH",
      "text": "Measure from the top of the sleeve (at the shoulder) to the end of the sleeve."
    }
  },
  "PANT": {
    "waist width": {
      "image": "https://reigningchamp.com/cdn/shop/files/RC_SIZE_GUIDE_PANT_WAIST.jpg?v=1723228080",
      "title": "WAIST WIDTH",
      "text": "Measure across the top of the waistband from one side to the other."
    },
    "front rise": {
      "image": "https://reigningchamp.com/cdn/shop/files/RC_SIZE_GUIDE_PANT_FRONT-RISE.jpg?v=1723228080",
      "title": "FRONT RISE",
      "text": "Measure from the crotch seam to the top of the waistband."
    },
    "inseam length": {
      "image": "https://reigningchamp.com/cdn/shop/files/RC_SIZE_GUIDE_PANT_INSEAM.jpg?v=1723228080",
      "title": "INSEAM LENGTH",
      "text": "Measure from the crotch seam to the bottom of the leg."
    },
    "leg opening": {
      "image": "https://reigningchamp.com/cdn/shop/files/RC_SIZE_GUIDE_PANT_LEG-OPENING.jpg?v=1723228081",
      "title": "LEG OPENING",
      "text": "Measure across the bottom of the leg opening from one side to the other."
    }
  },
  "SHORT": {
    "waist width": {
      "image": "https://reigningchamp.com/cdn/shop/files/RC_SIZE_GUIDE_SHORT_WAIST.jpg?v=1723228083",
      "title": "WAIST WIDTH",
      "text": "Measure across the top of the waistband from one side to the other."
    },
    "front rise": {
      "image": "https://reigningchamp.com/cdn/shop/files/RC_SIZE_GUIDE_SHORT_FRONT-RISE.jpg?v=1723228083",
      "title": "FRONT RISE",
      "text": "Measure from the crotch seam to the top of the waistband."
    },
    "inseam length": {
      "image": "https://reigningchamp.com/cdn/shop/files/RC_SIZE_GUIDE_SHORT_INSEAM.jpg?v=1723228083",
      "title": "INSEAM LENGTH",
      "text": "Measure from the crotch seam to the bottom of the leg."
    },
    "leg opening": {
      "image": "https://reigningchamp.com/cdn/shop/files/RC_SIZE_GUIDE_SHORT_LEG-OPENING.jpg?v=1723228083",
      "title": "LEG OPENING",
      "text": "Measure across the bottom of the leg opening from one side to the other."
    }
  },
  "ROBE": {
    "shoulder width": {
      "image": "https://reigningchamp.com/cdn/shop/files/RC_SIZE_GUIDE_ROBE_SHOULDER.jpg?v=1723228082",
      "title": "SHOULDER WIDTH",
      "text": "Measure from the top of one sleeve (at the shoulder) to the other."
    },
    "chest width": {
      "image": "https://reigningchamp.com/cdn/shop/files/RC_SIZE_GUIDE_ROBE_CHEST.jpg?v=1723228082",
      "title": "CHEST WIDTH",
      "text": "Measure across the chest from one side of the item to the other, one inch below the armpit."
    },
    "body length": {
      "image": "https://reigningchamp.com/cdn/shop/files/RC_SIZE_GUIDE_ROBE_BODY.jpg?v=1723228082",
      "title": "BODY LENGTH",
      "text": "Measure from the highest point on the shoulder seam (next to the collar) straight down to the bottom of the item."
    },
    "sleeve length": {
      "image": "https://reigningchamp.com/cdn/shop/files/RC_SIZE_GUIDE_ROBE_SLEEVE.jpg?v=1723228082",
      "title": "SLEEVE LENGTH",
      "text": "Measure from the top of the sleeve (at the shoulder) to the end of the sleeve."
    }
  },
  "SLEEVELESS": {
    "shoulder width": {
      "image": "https://reigningchamp.com/cdn/shop/files/RC_SIZE_GUIDE_SLEEVELESS_SHOULDER.jpg?v=1723228083",
      "title": "SHOULDER WIDTH",
      "text": "Measure from the top of one sleeve (at the shoulder) to the other."
    },
    "chest width": {
      "image": "https://reigningchamp.com/cdn/shop/files/RC_SIZE_GUIDE_SLEEVELESS_CHEST.jpg?v=1723228084",
      "title": "CHEST WIDTH",
      "text": "Measure across the chest from one side of the item to the other, one inch below the armpit."
    },
    "body length": {
      "image": "https://reigningchamp.com/cdn/shop/files/RC_SIZE_GUIDE_SLEEVELESS_BODY.jpg?v=1723228084",
      "title": "BODY LENGTH",
      "text": "Measure from the highest point on the shoulder seam (next to the collar) straight down to the bottom of the item."
    }
  }
};

const FIGURE_BY_SUBTYPE: Record<string, string> = {
  "sweaters": "L-SLEEVE",
  "coats": "JACKET",
  "t-shirts": "S-SLEEVE",
  "shirts": "LS_SHIRT",
  "pants": "PANT",
  "jackets": "JACKET",
  "shorts": "SHORT",
  "sweatshirts": "L-SLEEVE",
  "robes": "ROBE",
  "polos": "S-SLEEVE",
  "polo shirts": "S-SLEEVE",
  "cardigans": "L-SLEEVE",
  "vests": "SLEEVELESS"
};

export function itemSlides(subType: string | null, keys: string[]): MeasureSlide[] {
  const figure = ITEM_SLIDES[FIGURE_BY_SUBTYPE[subType ?? ""] ?? ""];
  if (!figure) return [];
  return keys.map((key) => figure[key]).filter((slide): slide is MeasureSlide => Boolean(slide));
}

export function bodySlides(labels: string[]): MeasureSlide[] {
  return labels.map((label) => BODY_SLIDES[label]).filter((slide): slide is MeasureSlide => Boolean(slide));
}
