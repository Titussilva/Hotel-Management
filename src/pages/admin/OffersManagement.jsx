import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Modal, ConfirmModal } from '../../components/ui/Modal';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { money } from '../../utils/money';
import { formatDate } from '../../utils/dates';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const offerSchema = z.object({
  code:          z.string().min(3, 'Code required').toUpperCase(),
  title:         z.string().min(3, 'Title required'),
  description:   z.string().optional(),
  discountType:  z.enum(['percentage', 'fixed']),
  discountValue: z.coerce.number().min(1, 'Value must be > 0'),
  minStayNights: z.coerce.number().min(1),
  validFrom:     z.string().optional(),
  validTo:       z.string().optional(),
});

export default function OffersManagement() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editOffer, setEditOffer] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(offerSchema) });

  function load() {
    setLoading(true);
    adminAPI.listOffers()
      .then((res) => setOffers(Array.isArray(res) ? res : (res.data || [])))
      .catch(() => setOffers([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditOffer(null);
    reset({ code: '', title: '', description: '', discountType: 'percentage', discountValue: 10, minStayNights: 1, validFrom: '', validTo: '' });
    setModalOpen(true);
  }

  function openEdit(offer) {
    setEditOffer(offer);
    reset({
      code: offer.code, title: offer.title, description: offer.description || '',
      discountType: offer.discountType, discountValue: offer.discountValue,
      minStayNights: offer.minStayNights,
      validFrom: offer.validFrom ? offer.validFrom.split('T')[0] : '',
      validTo:   offer.validTo   ? offer.validTo.split('T')[0]   : '',
    });
    setModalOpen(true);
  }

  async function onSubmit(values) {
    try {
      if (editOffer) {
        await adminAPI.updateOffer(editOffer._id, values);
        toast.success('Offer updated');
      } else {
        await adminAPI.createOffer(values);
        toast.success('Offer created');
      }
      setModalOpen(false);
      load();
    } catch (e) {
      toast.error(e.message || 'Failed');
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await adminAPI.deleteOffer(deleteTarget._id);
      toast.success('Offer deactivated');
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Offers Management</h1>
          <p className="page-subtitle">{offers.length} offers</p>
        </div>
        <Button onClick={openCreate}><Plus size={16} /> Add offer</Button>
      </div>

      {loading ? (
        <div className="card p-5"><TableSkeleton rows={5} /></div>
      ) : (
        <div className="card overflow-auto">
          <table className="w-full min-w-[700px]">
            <thead className="border-b border-slate-100 bg-slate-50/70">
              <tr>
                <th className="table-th">Code</th>
                <th className="table-th">Title</th>
                <th className="table-th">Discount</th>
                <th className="table-th">Min nights</th>
                <th className="table-th">Valid until</th>
                <th className="table-th">Status</th>
                <th className="table-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((o) => (
                <tr key={o._id} className="table-row">
                  <td className="table-td font-mono font-bold text-pine">{o.code}</td>
                  <td className="table-td font-medium">{o.title}</td>
                  <td className="table-td">
                    {o.discountType === 'percentage' ? `${o.discountValue}%` : money(o.discountValue)}
                    <Badge variant="slate" className="ml-2">{o.discountType}</Badge>
                  </td>
                  <td className="table-td">{o.minStayNights} night{o.minStayNights !== 1 ? 's' : ''}</td>
                  <td className="table-td">{o.validTo ? formatDate(o.validTo) : '—'}</td>
                  <td className="table-td"><StatusBadge status={o.active ? 'active' : 'inactive'} /></td>
                  <td className="table-td">
                    <div className="flex gap-1.5">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(o)}><Edit2 size={14} /></Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => setDeleteTarget(o)}><Trash2 size={14} /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editOffer ? 'Edit offer' : 'Create offer'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Code *</label>
              <input className={`input-field font-mono uppercase ${errors.code ? 'input-error' : ''}`} {...register('code')} />
              {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code.message}</p>}
            </div>
            <div>
              <label className="label">Title *</label>
              <input className={`input-field ${errors.title ? 'input-error' : ''}`} {...register('title')} />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
            </div>
            <div>
              <label className="label">Discount type</label>
              <select className="input-field" {...register('discountType')}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (₹)</option>
              </select>
            </div>
            <div>
              <label className="label">Discount value *</label>
              <input type="number" className={`input-field ${errors.discountValue ? 'input-error' : ''}`} {...register('discountValue')} />
              {errors.discountValue && <p className="mt-1 text-xs text-red-500">{errors.discountValue.message}</p>}
            </div>
            <div>
              <label className="label">Min nights</label>
              <input type="number" className="input-field" min={1} {...register('minStayNights')} />
            </div>
            <div>
              <label className="label">Valid from</label>
              <input type="date" className="input-field" {...register('validFrom')} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Valid to</label>
              <input type="date" className="input-field" {...register('validTo')} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea className="input-field h-16 resize-none" {...register('description')} />
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>{editOffer ? 'Save' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete}
        loading={deleting} title="Deactivate offer" danger confirmLabel="Deactivate"
        message={`Deactivate offer "${deleteTarget?.code}"?`} />
    </div>
  );
}
