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

export function TemplateHadist( {activeHadist} ) {
  return (
    <motion.div 
      className="w-full h-full flex flex-col items-center justify-center relative text-center min-h-[400px]"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit="exit"
    >
      <motion.div className="text-slate-800 px-12" variants={itemVariants}>
<div className="relative max-w-4xl mx-auto text-center my-12">
  {/* Teks Hadis - Lebih tajam, ukuran proporsional, dan anggun */}
  <p className="text-2xl md:text-3xl font-serif italic text-slate-800 leading-loose mb-8">
    "{activeHadist.text}"
  </p>
  
  {/* Pembatas Elegan */}
  <div className="w-12 h-[2px] bg-emerald-500 mx-auto mb-6 rounded-full" />
  
  {/* Takhrij - Terlihat seperti sumber/referensi resmi */}
  <p className="text-sm md:text-base font-medium uppercase tracking-widest">
    {activeHadist.takhrij}
  </p>
</div>  
      </motion.div>
    </motion.div>
  );
}
