import { HADIST } from '../../../utils/constants';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.3, delayChildren: 0.2 }
  },
  exit: { opacity: 0, scale: 1.05, transition: { duration: 0.4 } }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 80 } }
};

export function TemplateHadist() {
  return (
    <motion.div 
      className="w-full h-full flex flex-col items-center justify-center relative text-center min-h-[400px]"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit="exit"
    >
      <motion.div className="text-slate-800 px-12" variants={itemVariants}>
        <p className="text-4xl md:text-5xl font-heading font-medium leading-relaxed mb-10 text-slate-700">
          {HADIST.teks}
        </p>
        <p className="text-xl md:text-2xl font-bold text-slate-500 uppercase tracking-widest">
          {HADIST.sumber}
        </p>
      </motion.div>
    </motion.div>
  );
}
