'use client'

import * as React from 'react'
import { Users, UserCheck, Wallet, ChartLineUp } from '@phosphor-icons/react'
import { motion } from 'motion/react'

export interface StatCardsProps {
  totalSiswa: number
  totalGuru: number
  saldoDana: string
  persentaseHadir: number
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export function StatCards({ totalSiswa, totalGuru, saldoDana, persentaseHadir }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1, duration: 0.4 }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className="bg-card p-6 rounded-[24px] border border-border shadow-sm flex items-center gap-4 transition-shadow hover:shadow-md"
      >
        <div className="p-4 bg-primary/10 text-primary rounded-[18px]">
          <Users weight="duotone" className="w-7 h-7" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Total Siswa Aktif</p>
          <h3 className="text-2xl font-bold font-heading text-card-foreground">{totalSiswa}</h3>
        </div>
      </motion.div>

      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2, duration: 0.4 }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className="bg-card p-6 rounded-[24px] border border-border shadow-sm flex items-center gap-4 transition-shadow hover:shadow-md"
      >
        <div className="p-4 bg-emerald-500/10 text-emerald-600 rounded-[18px]">
          <UserCheck weight="duotone" className="w-7 h-7" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Total Guru Aktif</p>
          <h3 className="text-2xl font-bold font-heading text-card-foreground">{totalGuru}</h3>
        </div>
      </motion.div>

      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3, duration: 0.4 }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className="bg-card p-6 rounded-[24px] border border-border shadow-sm flex items-center gap-4 transition-shadow hover:shadow-md"
      >
        <div className="p-4 bg-amber-500/10 text-amber-600 rounded-[18px]">
          <Wallet weight="duotone" className="w-7 h-7" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Total Saldo Kas</p>
          <h3 className="text-2xl font-bold font-heading text-card-foreground">{saldoDana}</h3>
        </div>
      </motion.div>

      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.4, duration: 0.4 }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className="bg-card p-6 rounded-[24px] border border-border shadow-sm flex items-center gap-4 transition-shadow hover:shadow-md"
      >
        <div className="p-4 bg-blue-500/10 text-blue-600 rounded-[18px]">
          <ChartLineUp weight="duotone" className="w-7 h-7" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Kehadiran Hari Ini</p>
          <h3 className="text-2xl font-bold font-heading text-card-foreground">{persentaseHadir}%</h3>
        </div>
      </motion.div>
    </div>
  )
}
