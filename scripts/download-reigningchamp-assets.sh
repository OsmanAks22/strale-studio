#!/usr/bin/env bash
# Downloads assets used by the reigningchamp.com homepage clone.
set -euo pipefail
D="public/sites/reigningchamp"
mkdir -p "$D/fonts" "$D/images/products" "$D/images/categories" "$D/images/content" "$D/images/menu" "$D/video"
C="https://reigningchamp.com/cdn/shop"
get() { [ -s "$2" ] || curl -sSfL -A "Mozilla/5.0" -o "$2" "$1"; }

get "$C/t/218/assets/AkzidGrtskProReg.woff2" "$D/fonts/akzidenz-grotesk-regular.woff2"
get "$C/t/218/assets/AkzidGrtskProMed.woff2" "$D/fonts/akzidenz-grotesk-medium.woff2"
get "$C/t/218/assets/AkzidGrtskProBolCnd.woff2" "$D/fonts/akzidenz-grotesk-bold-condensed.woff2"

get "$C/videos/c/vp/fdbfea855d674ff9a8ce98c2fa92ab45/fdbfea855d674ff9a8ce98c2fa92ab45.HD-1080p-3.3Mbps-96492773.mp4?v=0" "$D/video/hero-refined-utility.mp4"
get "$C/files/preview_images/fdbfea855d674ff9a8ce98c2fa92ab45.thumbnail.0000000000_1920x.jpg?v=1791233207" "$D/video/hero-refined-utility-poster.jpg"
get "$C/videos/c/vp/658be6d359f147b7b14ab9d3cab8ddf6/658be6d359f147b7b14ab9d3cab8ddf6.HD-1080p-3.3Mbps-95586339.mp4?v=0" "$D/video/performance-desktop.mp4"
get "$C/files/preview_images/658be6d359f147b7b14ab9d3cab8ddf6.thumbnail.0000000000_1920x.jpg?v=1790373286" "$D/video/performance-desktop-poster.jpg"
get "$C/videos/c/vp/63bbdc6f43c7426c813fdf514ee6f1b7/63bbdc6f43c7426c813fdf514ee6f1b7.HD-1080p-3.3Mbps-95586338.mp4?v=0" "$D/video/performance-mobile.mp4"
get "$C/files/preview_images/63bbdc6f43c7426c813fdf514ee6f1b7.thumbnail.0000000000_750x.jpg?v=1790373288" "$D/video/performance-mobile-poster.jpg"

while read -r name file; do
  get "$C/files/$file&width=720" "$D/images/products/$name.jpg"
done <<'LIST'
wool-fleece-chore-jacket-heather-brown FW26_RC-4341_HEATHERBROWN_JACKET_off_1.jpg?v=1788374875
cotton-flannel-highland-shirt-arctic-wolf-oxide FW26_RC-8074_ARCTICWOLF-OXIDE_SHIRTING_off_1.jpg?v=1788374876
poly-pique-campo-standard-track-pant-5738-navy FW26_RC-5738_NAVY_PANT_off_1.jpg?v=1787074019
merino-kenny-quarter-zip-nep-heather-grey FW26_RC-6173_NEPHGREY_SWEATER_off_1.jpg?v=1788542816
merino-jersey-vista-slim-t-shirt-black FW26_RC-1686_BLACK_T-SHIRT_off_1.jpg?v=1788374874
poly-pique-campo-standard-track-jacket-3235-navy FW26_RC-3235_NAVY_SWEATER_off_1.jpg?v=1788374874
wool-fleece-ridge-zip-jacket-heather-black FW26_RC-3234_HEATHERBLACK_SWEATER_off_1.jpg?v=1787778042
merino-jersey-vista-slim-t-shirt-carbon FW26_RC-1686_CARBON_T-SHIRT_off_1.jpg?v=1788374873
poly-pique-campo-standard-track-pant-5738-petrol FW26_RC-5738_PETROL_PANT_off_1.jpg?v=1787937271
midweight-jersey-standard-long-sleeve-2361-black FW26_RC-2361_BLACK_T-SHIRT_off_1.jpg?v=1785518281
poly-pique-campo-standard-track-jacket-3235-petrol FW26_RC-3235_PETROL_SWEATER_off_1.jpg?v=1788374874
dual-fleece-relaxed-sweatpant-black FW26_RC-5731_BLACK_PANT_off_1.jpg?v=1787937272
LIST

while read -r name file; do
  get "$C/files/$file&width=750" "$D/images/categories/$name.jpg"
done <<'LIST'
t-shirts FW26_RC-2356_SAND_T-SHIRT_off_1.webp?v=1791233378
pants FW26_RC-5732_HEATHERCOFFEE_PANT_off_1_1.webp?v=1791233378
knitwear FW26_RC-6173_SNOWHILL_SWEATER_off_1.webp?v=1791233378
shirts FW26_RC-8074_ARCTICWOLF-OXIDE_SHIRTING_off_1_1.webp?v=1791233378
accessories SS26_RC-7627_BROWN_BELT_off_1_dadf53ae-2e3e-4867-8cae-a904c4ecea5e_1.webp?v=1789761174
LIST

get "$C/files/403A4367_compressed.jpg?v=1791233267&width=1500" "$D/images/content/sweats.jpg"
get "$C/files/NEW_CROP_403A3826_1.jpg?v=1791233256&width=1500" "$D/images/content/jackets-outerwear.jpg"

get "$C/files/403A4367_compressed_59b4db22-d1da-4a8b-ad24-eb73eb9f2e7d.jpg?v=1791262151&width=720" "$D/images/menu/latest.jpg"
get "$C/files/center_20260619_FW26_Lookbook-Testing2158_FULLRES_compressed_83506b23-8a9c-4cfa-a9c7-2e58c37126d7.jpg?v=1788276020&width=720" "$D/images/menu/clothing.jpg"
get "$C/files/center_20260619_FW26_Lookbook-Testing3573_FULLRES_compressed_5aa61605-cdd3-458b-b1a5-f071ce5d9fe3.jpg?v=1788276156&width=720" "$D/images/menu/accessories.jpg"
get "$C/files/center_20260619_FW26_Lookbook-Testing5160_FULLRES_compressed_65851c6b-06ad-491f-b391-45553411ff17.jpg?v=1788276079&width=720" "$D/images/menu/shop-by.jpg"
echo done
