# Digital Entanglement

Digital Entanglement is an interactive artwork created in p5.js

## Artists Statement

*You blinked and the world rewrote itself. Are you still in control, or just another line of code?*

My major project, Digital Entanglement, critiques society's increasing overreliance on digital technologies and their effect on our perception of reality. Unfolding across five scenes - each corresponding to a stanza from Philip Larkin’s Aubade - the artwork offers a contemporary exploration into themes of interdependence, existential dread, and postmodern alienation. Interpreted through a computational lens, the piece transforms these ideas into surreal digital landscapes where technology and reality intersect.

Interaction lies at the heart of Digital Entanglement. Using data from the viewer’s webcam, the piece invites viewers to experience how their own physical presence is depicted in a digital environments. Crucially, the piece never reveals the user’s image directly. Instead, it distorts and fragments their likeness, forcing the viewer to question what is real and what is simulated. Physical movement, both by the viewer and within the viewer’s environment, is encouraged - directly influencing the visuals and allowing individuals to experience a dynamic, real-time portrayal of how the digital realm can reshape and redefine one’s sense of self.

Blinking - a typically subconscious action - is the driving force behind the piece, advancing the artwork through its many stages. This design choice constrains the artwork to the linearity of real time. Each blink symbolises a moment lost - an action that cannot be undone - emphasising the inevitability of progression and underscoring how every digital interaction leaves an indelible mark on us.

Secondary gestures, such as mouse and keyboard inputs, are also available - introducing additional glitch effects and distortions. These however, have been kept intentionally subtle, serving a supportive role. In doing so, the artwork encourages viewers to engage primarily through physical movement, emphasising the significance of instinctive actions and demonstrating how our real-world presence can actively shape and influence the digital realm.

In this way, Digital Entanglement presents a layered exploration of our complex relationship with technology - urging viewers to question whether we shape the digital world or if, increasingly, it shapes us.

## References
### Facial Detection & Blink Detection Resources
Obviously a large part of my sketch revolves around blink detection and facemesh. While I ended up going with the handsfree.js library (and Golan's approach), I did a fair bit of research before deciding on this point. Below are both sketches I used directly within my final work, and some additional points of reference.

#### Blink Detection
- [1] Golan Levin. 2022. Blink measurement system in p5.js using Handsfree.js. Retrieved from https://www.youtube.com/watch?v=R7sppRAlxA4
- [2] Golan Levin. 2022. Crappy Blink Detector using p5.js + handsfree.js. Retrieved from https://editor.p5js.org/golan/sketches/d-JfFcGws
- [3] Lingdong Huang. 2019. Age2Death. Retrieved from https://age2death.glitch.me
- [4] midiblocks & CreativeInquiry. 2024. Handsfree.js. Retrieved from https://handsfreejs.netlify.app/
- [5] Oz Ramos. 2021. Introducing Handsfree.js - Integrate hand, face, and pose gestures to your frontend. Retrieved from https://dev.to/ozramos/
- [6] Sinan Ascioglu. 2021. Handsfree.js example. Retrieved from https://openprocessing.org/sketch/1215365/

#### Other Approaches Investigated
- [1] Auduno. 2017. Clmtracker. Retrieved from https://github.com/auduno/clmtrackr
- [2] Emceelamb. 2018. CLM Tracker Type. Retrieved from https://editor.p5js.org/Emceelamb/sketches/rypGIAV1E
- [3] Good Morning Developers. 2024. Want To Learn Some AI With JavaScript? Let's Do Facial Recognition! Retrieved from https://www.youtube.com/watch?app=desktop&v=NG5Vi8zrqMM
- [4] Google. 2024. Face mesh detection. Retrieved from https://developers.google.com/ml-kit/vision/face-mesh-detection
- [5] Kazuki Umeda. 2021. Real Time Face Detection in p5.js. Retrieved from https://www.youtube.com/watch?v=3yqANLRWGLo
- [6] Kyle McDonald. 2019. Face Tracking (clmtrackr). Retrieved from https://editor.p5js.org/kylemcdonald/sketches/BJOcyD9hm
- [7] Makeitnow. 2019. How to use Opencv Javascript For Face detection using pre-built opencv.js? Retrieved from https://www.youtube.com/watch?v=-E8pdgsZ-ds
- [8] NYU ITP. 2024. Ml5.js. Retrieved from https://ml5js.org/

### Typewriter Effect
- [1] lucia. 2022. Typewriter effect P5.JS. Retrieved from https://stackoverflow.com/questions/72221785/typewriter-effect-p5-js 
- [2] pippinbarr. 2022. Simple Typewriter Effect. Retrieved from https://editor.p5js.org/pippinbarr/sketches/bjxEfpiwS 
 
### Webcam Sizing & Aspect Ratios
- [1] enickles. 2021. Resize image to canvas and maintain aspect ratio. Retrieved from https://editor.p5js.org/enickles/sketches/QpS9ujOuL  
- [2] JohnSmith6. 2020. Webcam stretched when canvas size fixed p5.js. Retrieved from https://stackoverflow.com/questions/61317487 webcam-stretched-when-canvas-size-fixed-p5-js  
- [3] Jeff Thompson. 2021. CP2: Webcam Input – Webcam Tracking in p5.js. Retrieved from https://www.youtube.com/watch?v=G3WxVV7aN4I

### Halftone & Pixelisation
- [1] Andrew Sink. 2020. Creating Pixelated Images using p5js / OpenProcessing Pixelator. Retrieved from https://www.youtube.com/watch?v=KfLqRuFjK5g 
- [2] Jeff Thompson. 2021. CP2: Reading Video Pixels – Webcam Tracking in p5.js. Retrieved from https://www.youtube.com/watch?v=VYg-YdGpW1o
- [3] Jeff Thompson. 2021. Video Pixels. Retrieved from https://editor.p5js.org/jeffThompson/sketches/Y2xbIzxpI 
- [4] samzmann. 2018. Get pixel brightness with p5.js. Retrieved from https://stackoverflow.com/questions/47888710/get-pixel-brightness-with-p5-js 

### Scratch Effect
- [1] czartacus. 2021. sobel edge detection. Retrieved from https://editor.p5js.org/czartacus/sketches/cSnxbWsFZ  
- [2] Jeff Thompson. 2021. CP2: Kernel Filters – Image Filters. Retrieved from https://www.youtube.com/watch?v=Sq8VPf7qXIE
- [3] Jeff Thompson. 2021. Kernel Filters. Retrieved from https://editor.p5js.org/jeffThompson/sketches/MyfhklBlv 
- [4] Victor Powell. 2014. Image Kernels Explained Visually. Retrieved from https://setosa.io/ev/image-kernels/

### ASCII Effect
- [1] codingtrain. 2022. CC 166: ASCII video. Retrieved from https://editor.p5js.org/codingtrain/sketches/KTVfEcpWx
- [2] Marc Duiker. 2022. Creative Coding with p5js: Scalable ASCII Video. Retrieved from https://www.youtube.com/watch?app=desktop&v=x0x-tvZJLfw 
- [3] tim rodenbröker. 2024. Creative Coding with p5.js: ASCII Blobs. Retrieved from https://www.youtube.com/watch?v=m_1lBVxIdM4 

### Mesh & Network Effect
- [1] shawn. 2021. Mesh Network Simulation. Retrieved from https://editor.p5js.org/shawn/sketches/Cm_B74KSs
- [2] Traversy Media. 2020.  Particles Effect With P5.js. Retrieved from https://www.youtube.com/watch?v=H-9jCNhLe-Q

### Glitch Effects
- [1] Barney Codes. 2022. Chromatic Aberration Glitch Shader in P5js. Retrieved from https://www.youtube.com/watch?v=r5YkU5Xu4_E
- [2] David Bouchard. 2021. RTA842 - 1.1 - Intro to p5.js and Glitch. Retrieved from https://www.youtube.com/watch?v=dEdpmbtgznU
- [3] newandnewermedia. 2021. p5.glitch romp. Retrieved from https://www.youtube.com/watch?v=MLAXt4sXNWI 
- [4] p5.glitch.me 2024. Glitch Video Example. Retrieved from https://p5.glitch.me/examples/web/P5L_p5.glitch-video.html
- [5] Ted Davis. 2020. P5.glitch-almost-everything. Retrieved from https://editor.p5js.org/ffd8/sketches/pckumarhp

### Audio / Ambience Used
- [1] InfamousJase. 2015. Electronic computer room ambience. Retrieved from https://freesound.org/people/InfamousJase/sounds/325523/  

### Font Used 
- [1] Studio Dot. 2019. BusMatrix Condensed. Retrieved from https://www.dafont.com/busmatrix-condensed.font 

#### Additional Works & Inspiration
Several works inspired me to create Digital Entanglement. While Philip Larkins' Aubade is woven throughout as the core text, I almost included T.S. Eliot's The Waste Land instead. Both of these poems discuss the fragmentation of modern life - well before technology existed as it does today. 

Ryoji Ikeda is a Japanese immersive media artist who I've studied in the past and was also a huge . I have taken alot of inspiration from his unique visual style, specifically from micro macro. 

Finally, the mentioned sketch from Bestesaylar was the inspiration for the blink technology in the first place. 

- [1] Philip Larkin. 1977. Aubade. Retrieved from https://www.poetryfoundation.org/poems/48422/aubade-56d229a6e2f07 
- [2] T.S. Elliot. 1922. The Waste Land. Retrieved from https://www.poetryfoundation.org/poems/47311/the-waste-land 
- [3] Ryoji Ikeda. 2022. Micro Macro. Retrieved from https://www.ryojiikeda.com/project/micro_macro/
- [4] NOWNESS. 2021. Ryoji Ikeda: a hypnotic audio-visual explosion. Retrieved from https://www.youtube.com/watch?v=cywFvcRR-QI 
- [5] bestesaylar. 2019. Eye tracking eyes. Retrieved from https://editor.p5js.org/bestesaylar/sketches/ogFdasRIc

## Instructions

As outlined in my artist statement, this artwork is relies heavily on your webcam and physicality. Please follow the instructions below to get the most out of the work! 

1. **You'll need a webcam to view the piece.**  
    - a) Please ensure you have **good lighting** and an okay webcam! It doesn't have to be studio quality, but your face should be clearly visible and shouldn't be 'glarey'.
    - b) Please take off glasses, hats, or anything else that may obscure your face.
    - c) Make sure there's no other program actively using your webcam (the sketch [wont load!](https://stackoverflow.com/questions/60837628/js-video-domexception-could-not-start-video-source))
    - d) If you have anything cool in the background, that's an added bonus! It'll make the work more engaging.
    - e) Don't forget to move around and experience the different environments.

2. **The blink logic is... okay.**  
    - a) I played around with many face-tracking/blink detection libraries (as outlined in my references). This one was the best, but it's still not perfect.
    - b) Sudden movements or squinting will likely be detected as a blink - sorry!  
    - c) If blink detection is struggling to pick up anything, pressing **Spacebar** is a failsafe that works the same as blinking.

3. **The facemesh logic is... pretty good!**  
    - a) However, the artwork won't load if the model can't detect your face. 
    - b) If this is the case, there is a button to toggle on '**Spacebar Only Mode**' within the loading screen. This mode really isn't ideal (it makes the finale quite lame), but it’s there if you need it.

4. **Extra Controls**  
    - a) Press **R** to Reset if needed.
    - b) There are a handful of easter eggs that you can use the mouse for, but M&KB aren’t required.
    - c) Since **Spacebar** increments, the thumbnail save button is now **S**.

5. **Modifying the script**  
    - a) **Space Bar Only Mode** can be toggled on at the top of the script (it's a bool).
    - b) If you're super curious to see the model in action (or need to test your webcam), there's a debugger that can also be toggled on (also a bool).

**P.S.** There are 26 (~2–3 mins) worth of scenes to 'blink through' before the artwork concludes!
