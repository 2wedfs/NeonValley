import { motion } from 'framer-motion';

export default function UsersManager() {
  return (
    <div className="min-h-[60vh] px-4 py-8 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border p-6"
        style={{
          background: 'rgba(255,255,255,0.03)',
          borderColor: 'rgba(255,255,255,0.08)',
        }}
      >
        <p className="text-xs uppercase tracking-widest" style={{ color: '#00F5D4' }}>Dashboard</p>
        <h1 className="mt-2 font-space text-3xl font-black text-white">Users</h1>
        <p className="mt-3 max-w-xl text-sm leading-6" style={{ color: 'rgba(255,255,255,0.62)' }}>
          This manager is ready for the NeonValley dashboard preview. Connect live admin data here when the Base44 dashboard source is available.
        </p>
      </motion.div>
    </div>
  );
}
