"use client"

import { useState, useEffect } from 'react'
import { User, Menu, Sun, Moon, ChevronDown } from 'lucide-react'
import { useTheme } from 'next-themes'

interface NavbarProps {
  onMenuToggle: () => void
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])


}