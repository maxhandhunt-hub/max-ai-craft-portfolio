import {initNavigation} from './navigation.js';
import {initViewer} from './viewer.js';
import {initChapters} from './scroll/chapters.js';

initNavigation();
initViewer();
if (window.gsap && window.ScrollTrigger) initChapters();
