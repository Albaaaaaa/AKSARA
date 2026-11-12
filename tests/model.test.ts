import test from 'node:test'
import assert from 'node:assert/strict'
import { mayEdit, recordsForRole, allowedTransition, achievementPercent } from '../src/model.ts'

const record = { id:'CAP-1', title:'Contoh', meta:'', unit:'Fungsi Diseminasi', date:'2026', status:'Draft' }
test('operator edits only own drafts and returned entries', () => {
  assert.equal(mayEdit('Operator','capaian',record),true)
  assert.equal(mayEdit('Operator','capaian',{...record,unit:'Sekretariat'}),false)
  assert.equal(mayEdit('Operator','capaian',{...record,status:'Disetujui'}),false)
  assert.equal(mayEdit('Pimpinan','capaian',record),false)
  assert.equal(mayEdit('Admin','capaian',{...record,status:'Dikunci'}),false)
})
test('submission and validation follow expected transitions', () => {
  assert.equal(allowedTransition('Operator','capaian',record,'Menunggu validasi'),true)
  assert.equal(allowedTransition('Operator','capaian',record,'Disetujui'),false)
  assert.equal(allowedTransition('Validator','capaian',{...record,status:'Menunggu validasi'},'Disetujui'),true)
  assert.equal(allowedTransition('Validator','capaian',record,'Disetujui'),false)
  assert.equal(allowedTransition('Admin','capaian',{...record,status:'Dikunci'},'Diarsipkan'),false)
})
test('operator scope excludes other units and administration', () => {
  const scoped=recordsForRole({capaian:[record,{...record,id:'CAP-2',unit:'Sekretariat'}],audit:[record]},'Operator')
  assert.equal(scoped.capaian.length,1)
  assert.equal(scoped.audit.length,0)
})
test('percentage handles decimal commas, zero and invalid inputs', () => {
  assert.equal(achievementPercent('100','95%'),95)
  assert.equal(achievementPercent('100','91,2'),91.2)
  assert.equal(achievementPercent('0','5'),null)
  assert.equal(achievementPercent('100',''),null)
  assert.equal(achievementPercent('abc','1'),null)
})
