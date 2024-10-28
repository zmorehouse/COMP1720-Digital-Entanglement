# Instructions

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