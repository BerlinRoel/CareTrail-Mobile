At line 377 and 378, 20 was subtracted from the top and left elements. 
Apparently, this is to account for the 20px padding applied to the overlay-hole.
However, this is causing problems with where the hole is appearing on the screen.
So it has been removed manually. 
If you update this jQuery plugin, be sure to remove the "- 20" from those two lines.
(And also remove it from the min file)