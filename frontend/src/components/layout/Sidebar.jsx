/**
 * Run 1: Left sidebar — brand, business card, nav sections
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getNavItems } from '../../config/navigation'
import { TIERS } from '../../config/tiers'
import { useBusiness } from '../../contexts/BusinessContext'
import SidebarItem from './SidebarItem'
import UpgradeModal from './UpgradeModal'

const Sidebar = ({ open }) => {
  const { business, businessType, tier, setBusinessType } = useBusiness()
  const [upgradeModal, setUpgradeModal] = useState(null)

  const nav = getNavItems(businessType)
  const tierInfo = TIERS[tier] || TIERS.free

  const handleLockedClick = (item) => {
    const requiredTier = TIERS[item.minTier]
    setUpgradeModal(requiredTier?.label || item.minTier)
  }

  const sectionLabels = {
    main: null,
    management: 'MANAGEMENT',
    business: 'BUSINESS',
    advanced: 'ADVANCED',
    system: null,
  }

  const renderSection = (key, items) => {
    if (!items?.length) return null
    const label = sectionLabels[key]

    return (
      <div key={key} className="py-2">
        {label && (
          <div className="px-3 py-1.5 text-[10px] uppercase tracking-wide text-muted font-medium">
            {label}
          </div>
        )}
        <div className="space-y-0.5">
          {items.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              currentTier={tier}
              onLockedClick={handleLockedClick}
            />
          ))}
        </div>
      </div>
    )
  }

  const sidebarContent = (
    <>
      {/* Brand header */}
      <div className="h-16 border-b border-border flex items-center px-6 shrink-0">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <i className="fa-solid fa-calendar-days text-white text-sm" />
          </div>
          <span className="font-heading font-bold text-xl text-primary">Rezvo</span>
        </Link>
      </div>

      {/* Business card */}
      <div className="px-6 py-3 border-b border-border">
        <p className="font-body text-sm font-semibold text-primary">
          {business?.name || 'Demo Business'}
        </p>
        <span
          className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase"
          style={{ color: tierInfo.color, backgroundColor: tierInfo.bg }}
        >
          {tierInfo.label}
        </span>
        <a
          href="#"
          className="block mt-1 text-xs text-muted hover:text-primary transition-colors"
        >
          View Public Page <i className="fa-solid fa-external-link text-[10px] ml-0.5" />
        </a>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {renderSection('main', nav.main)}
        {renderSection('management', nav.management)}
        {renderSection('business', nav.business)}
        {renderSection('advanced', nav.advanced)}
        <div className="border-t border-border mt-2 pt-2">
          {renderSection('system', nav.system)}
        </div>
      </nav>
    </>
  )

  // Desktop: always visible. Mobile: overlay, slides in when open
  const asideClasses = [
    'w-64 bg-white border-r border-border flex flex-col shrink-0',
    'fixed lg:relative inset-y-0 left-0 z-40',
    'transform transition-transform duration-200 ease-out',
    open ? 'translate-x-0' : '-translate-x-full',
    'lg:translate-x-0',
  ].join(' ')

  return (
    <>
      <aside className={asideClasses}>
        {sidebarContent}
      </aside>

      {upgradeModal && (
        <UpgradeModal
          tierName={upgradeModal}
          onClose={() => setUpgradeModal(null)}
          onViewPlans={() => {
            setUpgradeModal(null)
            // TODO: navigate to plans page
          }}
        />
      )}
    </>
  )
}

export default Sidebar
