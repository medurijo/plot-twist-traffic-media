"""Compose a 1080x1920 cover: frame + bold stroked headline + highlight ring + label."""
import sys
from PIL import Image, ImageDraw, ImageEnhance, ImageFont, ImageFilter

FONT = "/usr/share/fonts/opentype/inter/InterDisplay-Black.otf"

def stroked(d, xy, text, size, fill, stroke=16, anchor="mm"):
    f = ImageFont.truetype(FONT, size)
    d.text(xy, text, font=f, fill=fill, stroke_width=stroke, stroke_fill="black", anchor=anchor)

def fit(text, maxw, size):
    while size > 40:
        f = ImageFont.truetype(FONT, size)
        if f.getbbox(text)[2] - f.getbbox(text)[0] <= maxw: return size
        size -= 4
    return size

def make(src, out, top, bottom, ring, tag, tag_col, by=None):
    im = Image.open(src).convert("RGB")
    im = ImageEnhance.Color(im).enhance(1.25); im = ImageEnhance.Contrast(im).enhance(1.08)
    W, H = im.size
    # dark gradient top & bottom for text
    ov = Image.new("RGBA", (W, H), (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
    for y in range(560):
        od.line([(0, y), (W, y)], fill=(0, 0, 0, int(150 * (1 - y / 560))))
    for y in range(H - 620, H):
        od.line([(0, y), (W, y)], fill=(0, 0, 0, int(170 * ((y - (H - 620)) / 620))))
    im = Image.alpha_composite(im.convert("RGBA"), ov)
    d = ImageDraw.Draw(im)
    # ring around the subject
    cx, cy, r = ring
    for k in range(10):
        d.ellipse([cx - r - k, cy - r - k, cx + r + k, cy + r + k], outline=(255, 214, 10, 255))
    # tag pill
    f = ImageFont.truetype(FONT, 46); tw = f.getbbox(tag)[2]
    d.rounded_rectangle([W / 2 - tw / 2 - 36, 120, W / 2 + tw / 2 + 36, 196], radius=38, fill=tag_col)
    d.text((W / 2, 158), tag, font=f, fill="white", anchor="mm")
    y = 330
    for line in top:
        s = fit(line, W - 90, 150); stroked(d, (W / 2, y), line, s, "white", 18); y += int(s * 1.05)
    y = by if by else H - 420
    for i, line in enumerate(bottom):
        s = fit(line, W - 90, 170); stroked(d, (W / 2, y), line, s, (255, 214, 10) if i == len(bottom) - 1 else "white", 20); y += int(s * 1.05)
    im.convert("RGB").save(out, quality=94)

EXTRA = {
 "ep4": ("ep4/t016.00.jpg", "PlotTwistTraffic_Q4_thumbnail.jpg", ["LAVA", "ON THE ROAD"], ["WHAT DO", "YOU DO?"], (414, 1044, 150), "PLOT TWIST TRAFFIC · Q4", (225, 29, 46), None),
 "ep5": ("ep5/t018.00.jpg", "PlotTwistTraffic_Q5_thumbnail.jpg", ["GIANT CAT", "ON THE ROAD"], ["WHAT DO", "YOU DO?"], (288, 1638, 120), "PLOT TWIST TRAFFIC · Q5", (225, 29, 46), 1180),
 "ep6": ("ep6/t018.80.jpg", "PlotTwistTraffic_Q6_thumbnail.jpg", ["A UFO BEAMS UP", "THE CAR AHEAD"], ["WHAT DO", "YOU DO?"], (324, 1512, 150), "PLOT TWIST TRAFFIC · Q6", (225, 29, 46), 1100),
 "ep7": ("ep7/t019.00.jpg", "PlotTwistTraffic_Q7_thumbnail.jpg", ["A BLACK HOLE", "IN THE ROUNDABOUT"], ["WHAT DO", "YOU DO?"], (345, 1270, 170), "PLOT TWIST TRAFFIC · Q7", (225, 29, 46), 1480),
 "ep8": ("ep8/t013.80.jpg", "PlotTwistTraffic_Q8_thumbnail.jpg", ["TSUNAMI ON", "THE ON-RAMP"], ["WHAT DO", "YOU DO?"], (905, 1720, 150), "PLOT TWIST TRAFFIC · Q8", (225, 29, 46), 1080),
 "ep9": ("ep9/t016.80.jpg", "PlotTwistTraffic_Q8_PurpleLight_thumbnail.jpg", ["THE TRAFFIC LIGHT", "TURNS PURPLE"], ["WHAT DO", "YOU DO?"], (324, 690, 170), "PLOT TWIST TRAFFIC · Q8", (178, 60, 255), 1350),
 "ep10": ("ep10/t036.60.jpg", "PlotTwistTraffic_Q9_Snail_thumbnail.jpg", ["A GIANT SNAIL", "ON THE MOTORWAY"], ["WHAT DO", "YOU DO?"], (414, 760, 260), "PLOT TWIST TRAFFIC · Q9", (225, 29, 46), 1240),
 "ep11": ("ep11/t014.40.jpg", "PlotTwistTraffic_Q10_Dinos_thumbnail.jpg", ["DINOSAURS ON THE", "ZEBRA CROSSING"], ["WHAT DO", "YOU DO?"], (300, 880, 190), "PLOT TWIST TRAFFIC · Q10", (225, 29, 46), 1180),
 "ep12": ("ep12/t006.60.jpg", "PlotTwistTraffic_Q11_Bike_thumbnail.jpg", ["A BICYCLE", "AT 200 KM/H"], ["WHAT DO", "YOU DO?"], (389, 975, 120), "PLOT TWIST TRAFFIC · Q11", (225, 29, 46), 1200),
 "ep14": ("ep14/t008.40.jpg", "PlotTwistTraffic_Q13_CruiseShip_thumbnail.jpg", ["CRUISE SHIP", "WRONG WAY!"], ["WHAT DO", "YOU DO?"], (513, 1250, 260), "PLOT TWIST TRAFFIC · Q13", (225, 29, 46), None),
 "ep15": ("ep15/t019.90.jpg", "PlotTwistTraffic_Q14_GPS_thumbnail.jpg", ["GPS SAYS:", "INTO THE SEA!"], ["WHAT DO", "YOU DO?"], (380, 930, 160), "PLOT TWIST TRAFFIC · Q14", (225, 29, 46), None),
 "ep16": ("ep16/t016.60.jpg", "PlotTwistTraffic_Q15_CottonCandy_thumbnail.jpg", ["COTTON CANDY", "STORM!"], ["WHAT DO", "YOU DO?"], (290, 1215, 260), "PLOT TWIST TRAFFIC · Q15", (225, 29, 46), None),
 "ep17": ("ep17/t016.20.jpg", "PlotTwistTraffic_Q15_BowlingBall_thumbnail.jpg", ["GIANT BOWLING", "BALL AHEAD!"], ["WHAT DO", "YOU DO?"], (540, 995, 170), "PLOT TWIST TRAFFIC · Q15", (225, 29, 46), None),
 "ep18": ("ep18/t010.00.jpg", "PlotTwistTraffic_Q16_Parking_thumbnail.jpg", ["PARK BETWEEN", "THESE TWO?!"], ["WHAT DO", "YOU DO?"], (500, 1050, 160), "PLOT TWIST TRAFFIC · Q16", (225, 29, 46), None),
 "ep21": ("ep21/t013.00.jpg", "PlotTwistTraffic_Q19_Carousel_thumbnail.jpg", ["CAROUSEL HORSES", "ON THE LOOSE!"], ["WHAT DO", "YOU DO?"], (400, 930, 200), "PLOT TWIST TRAFFIC · Q19", (225, 29, 46), None),
 "ep22": ("ep22/t012.40.jpg", "PlotTwistTraffic_Q20_Balloon_thumbnail.jpg", ["BALLOON LANDS", "IN YOUR LANE!"], ["WHAT DO", "YOU DO?"], (760, 660, 230), "PLOT TWIST TRAFFIC · Q20", (225, 29, 46), None),
 "ep19": ("ep19/t007.00.jpg", "PlotTwistTraffic_Q17_Moose_thumbnail.jpg", ["GREEN LIGHT", "BUT A MOOSE?!"], ["WHAT DO", "YOU DO?"], (520, 800, 190), "PLOT TWIST TRAFFIC · Q17", (225, 29, 46), None),
 "ep20": ("ep20/t004.50.jpg", "PlotTwistTraffic_Q18_Octopus_thumbnail.jpg", ["OCTOPUS ON", "YOUR WINDSCREEN!"], ["WHAT DO", "YOU DO?"], (560, 820, 250), "PLOT TWIST TRAFFIC · Q18", (225, 29, 46), None),
 "ep23": ("ep23/t003.00.jpg", "PlotTwistTraffic_Q21_Dragon_thumbnail.jpg", ["PARK BETWEEN", "A DRAGON & ITS EGG?!"], ["WHAT DO", "YOU DO?"], (330, 990, 150), "PLOT TWIST TRAFFIC · Q21", (225, 29, 46), None),
 "ep25": ("ep25/glare.jpg", "PlotTwistTraffic_Q23_Lighthouse_thumbnail.jpg", ["SOMETHING IS", "BLINDING YOU!"], ["WHAT DO", "YOU DO?"], (640, 915, 330), "PLOT TWIST TRAFFIC · Q23", (225, 29, 46), None),
 "ep26": ("ep26/t015.20.jpg", "PlotTwistTraffic_Q24_WarningTriangle_thumbnail.jpg", ["YOUR TRIANGLE", "REFUSES TO STAND!"], ["WHAT DO", "YOU DO?"], (540, 900, 330), "PLOT TWIST TRAFFIC · Q24", (225, 29, 46), None),
 "ep27": ("ep27/t006.60.jpg", "PlotTwistTraffic_Q25_Goose_thumbnail.jpg", ["A GOOSE IS", "TAILGATING YOU!"], ["WHAT DO", "YOU DO?"], (690, 800, 230), "PLOT TWIST TRAFFIC · Q25", (225, 29, 46), None),
 "ep28": ("ep28/t005.00.jpg", "PlotTwistTraffic_Q26_Sumo_thumbnail.jpg", ["PARK BETWEEN", "TWO SUMOS?!"], ["WHAT DO", "YOU DO?"], (540, 1240, 300), "PLOT TWIST TRAFFIC · Q26", (225, 29, 46), None),
 "ep29": ("ep29/t006.60.jpg", "PlotTwistTraffic_Q27_SkiJump_thumbnail.jpg", ["THE ON-RAMP IS", "A SKI JUMP!"], ["WHAT DO", "YOU DO?"], (630, 620, 150), "PLOT TWIST TRAFFIC · Q27", (225, 29, 46), None),
 "ep30": ("ep30/t008.50.jpg", "PlotTwistTraffic_Q28_Whale_thumbnail.jpg", ["THIS TUNNEL", "JUST BLINKED!"], ["WHAT DO", "YOU DO?"], (200, 650, 115), "PLOT TWIST TRAFFIC · Q28", (225, 29, 46), None),
 "ep31": ("ep31/t006.00.jpg", "PlotTwistTraffic_Q28_SpeedCamera_thumbnail.jpg", ["THIS SPEED CAMERA", "IS A PHOTOGRAPHER!"], ["WHAT DO", "YOU DO?"], (560, 860, 260), "PLOT TWIST TRAFFIC · Q28", (225, 29, 46), None),
 "ep32": ("ep32/t006.60.jpg", "PlotTwistTraffic_Q29_Treadmill_thumbnail.jpg", ["THE ROAD IS A", "GIANT TREADMILL!"], ["WHAT DO", "YOU DO?"], (705, 1020, 200), "PLOT TWIST TRAFFIC · Q29", (225, 29, 46), None),
 "ep33": ("ep33/t013.00.jpg", "PlotTwistTraffic_Q30_Dominoes_thumbnail.jpg", ["THIS TRAFFIC JAM IS", "GIANT DOMINOES!"], ["WHAT DO", "YOU DO?"], (800, 900, 300), "PLOT TWIST TRAFFIC · Q30", (225, 29, 46), None),
 "ep34": ("ep34/t007.80.jpg", "PlotTwistTraffic_Q31_SpinningTop_thumbnail.jpg", ["THE ROUNDABOUT IS A", "GIANT SPINNING TOP!"], ["WHAT DO", "YOU DO?"], (540, 1000, 260), "PLOT TWIST TRAFFIC · Q31", (225, 29, 46), None),
 "ep35": ("ep35/t009.20.jpg", "PlotTwistTraffic_Q30_Racehorses_thumbnail.jpg", ["RACEHORSES ON", "THE ON-RAMP!"], ["WHAT DO", "YOU DO?"], (700, 1000, 260), "PLOT TWIST TRAFFIC · Q30", (225, 29, 46), None),
 "ep36": ("ep36/t010.00.jpg", "PlotTwistTraffic_Q31_SleepingBears_thumbnail.jpg", ["PARK BETWEEN TWO", "SLEEPING BEARS!"], ["WHAT DO", "YOU DO?"], (620, 960, 220), "PLOT TWIST TRAFFIC · Q31", (225, 29, 46), None),
 "ep24": ("ep24/t022.40.jpg", "PlotTwistTraffic_Q22_Rollercoaster_thumbnail.jpg", ["ROLLERCOASTER", "WAITING TIME: LONG"], ["WHAT DO", "YOU DO?"], (560, 880, 260), "PLOT TWIST TRAFFIC · Q22", (225, 29, 46), None),
 "ep13": ("ep13/t019.20.jpg", "PlotTwistTraffic_Q12_Meteor_thumbnail.jpg", ["METEORITE", "VS. TRAFFIC JAM"], ["WHAT DO", "YOU DO?"], (870, 260, 210), "PLOT TWIST TRAFFIC · Q12", (225, 29, 46), 1150),
}
if __name__ == "__main__" and sys.argv[1] in EXTRA:
    make(*EXTRA[sys.argv[1]]); sys.exit()
if __name__ == "__main__":
    which = sys.argv[1]
    if which == "ep2":
        make("ep2/t023.95.jpg", "PlotTwistTraffic_Q2_thumbnail.jpg", ["YOUR LANE ENDS…", "THE OTHER LANE", "IS ALL TANKS"], ["WHAT DO", "YOU DO?"], (600, 765, 125), "PLOT TWIST TRAFFIC · Q2", (225, 29, 46))
    else:
        make("ep3/shift.jpg", "PlotTwistTraffic_Q3_thumbnail.jpg", ["10,000", "RUBBER DUCKS", "ON THE ROAD"], ["WHAT DO", "YOU DO?"], (545, 905, 115), "PLOT TWIST TRAFFIC · Q3", (225, 29, 46))
