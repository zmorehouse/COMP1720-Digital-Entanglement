# Instructions

As outlined in my artist statement, this artwork is relies heavily on a few elements. Please follow the instructions below to get the most out of the work! 

1) You'll need a webcam to view the piece. 
    a) Please ensure you have good lighting and an okay webcam! It doesn't have to be studio quality but your face should be clearly visible.
    b) Please take off glasses, hats or anything else that may obscure your face.
    c) If you have anything cool in the background, thats an added bonus! It'll make the work more interesting.
    d) Don't forget to move around and experience the different environments. 

2) The blink logic is... okay. 
    a) I played around with a whole lot of facetracking / blink detection libraries. This one was the best, but its still not perfect. 
    b) Sharp or sudden movements (or squinting) will likely detect as a blink, sorry!  
    b) If the blink detection is struggling to pick up anything - Spacebar is a failsafe that works the same as blinking.

3) The facemesh logic is... pretty good!
    a) The artwork wont load if the model can't detect your face. 
    b) If this is the case, there is a button to toggle on 'Spacebar Only Mode' within the loading screen. This really isn't ideal (it makes the finale quite lame) but is there if you need it. 

4) Extra Controls
    a) Press R to Reset if needed
    b) There are a handful of easter eggs you can use the mouse for, however M&KB aren't required. 
    c) Because Spacebar increments, the thumbnail save button is now S 

5) Modifying the script
    a) Space Bar Only Mode can be toggled on at the top of the script (it's a bool)
    b) Similarly, if you're really curious to see the model working there is a debugger I've left in that can also be toggled on (also a bool)

P.S. There are 26 (~2-3 mins) worth of scenes to 'blink through' before the artwork concludes! 