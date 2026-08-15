import React from 'react';
import { X, AlertTriangle, Check } from 'lucide-react';
import { formatVND } from '../services/api';

export default function DuplicateModal({ existingItem, newItemData, onConfirmAdd, onCancel }) {
  if (!existingItem) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--apple-amber)' }}>
            <AlertTriangle size={20} />
            <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              Duplicate Model Detected
            </h2>
          </div>
          <button className="close-btn" onClick={onCancel}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="modal-body">
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            A diecast with a matching casting is already present in your vault. Compare the two entries below:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.25rem' }}>
            {/* Existing Vault Item */}
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1rem' }}>
              <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: '0.4rem' }}>
                Existing in Vault
              </div>
              <div style={{ fontWeight: 600, color: 'var(--apple-blue)', fontSize: '0.75rem' }}>
                {existingItem.brand} ({existingItem.scale})
              </div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem', margin: '0.2rem 0' }}>
                {existingItem.casting_name}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Livery: {existingItem.livery || 'N/A'}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Condition: {existingItem.condition}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                Paid: {formatVND(existingItem.purchase_price)}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--apple-green)', fontWeight: 600 }}>
                Value: {formatVND(existingItem.current_value)}
              </div>
            </div>

            {/* New Entry */}
            <div style={{ background: 'rgba(10, 132, 255, 0.06)', border: '1px solid rgba(10, 132, 255, 0.3)', borderRadius: 'var(--radius-lg)', padding: '1rem' }}>
              <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--apple-blue)', fontWeight: 600, marginBottom: '0.4rem' }}>
                New Model Entry
              </div>
              <div style={{ fontWeight: 600, color: 'var(--apple-blue)', fontSize: '0.75rem' }}>
                {newItemData.brand} ({newItemData.scale})
              </div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem', margin: '0.2rem 0' }}>
                {newItemData.casting_name}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Livery: {newItemData.livery || 'N/A'}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Condition: {newItemData.condition}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                Paid: {formatVND(newItemData.purchase_price)}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--apple-green)', fontWeight: 600 }}>
                Value: {formatVND(newItemData.current_value)}
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--separator)' }}>
            <button className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={onConfirmAdd}>
              <Check size={16} />
              <span>Add as Variant</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
