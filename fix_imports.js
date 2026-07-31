const fs = require('fs');
let content = fs.readFileSync('client/src/components/fitness/MuscleDiagram.jsx', 'utf8');

const correctImports = `import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiActivity, FiCheckCircle, FiClock, FiTrendingUp, FiX, FiLayers, FiInfo, FiZap } from 'react-icons/fi';

import anatomyFrontRaw from '../../assets/anatomy.svg?raw';
import anatomyBackRaw from '../../assets/anatomy_back.svg?raw';

/**`;

content = correctImports + content.split(' * High-Fidelity Muscle Focus Card')[1];

fs.writeFileSync('client/src/components/fitness/MuscleDiagram.jsx', content);
