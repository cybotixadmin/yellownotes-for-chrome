// debug switches - set all to false in a production setting

const filter_debug = true;

const cache_debug = true;

const sort_debug = true;


const function_call_debuging = true;

const DOM_debug = true;

const event_debug = true;


const jwt_debug = false;

const pagescan_debug = true;


// main a contstant for how heigh the bar should be for the controls only accessible to the note owner (or administrator)
/*
the owner of the note have extra controls in a bar on the bottom (buttons, drop-downs etc.)

This is height is added to the heigh the note will ordinarily have and is substracted fro mthe height of the note when the note is saved to the database.

 */

const note_owners_control_bar_height = 23;


const whole_note_minimized_height = 43;


const default_box_width = "350px";
const default_box_height = "250px";

const frame_note_top_bar_height = 50;

const note_internal_height_padding = 25;

const note_internal_width_padding = 3;

// The width of the draggable frame around the note
// this give the appearance of a wide border around the note. The user can resize the note by dragging on this bar
const draggable_frame_width = 10;


 // the margin within which the user can resize the note by dragging the edges
 const resizeBorderMargin = 10;


