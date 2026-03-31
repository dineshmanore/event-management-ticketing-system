function isNumericId(val) {
  return typeof val === 'string' && /^[0-9]+$/.test(val);
}

function buildIdQuery(id) {
  if (!id) return null;
  if (isNumericId(String(id))) return { mysqlId: Number(id) };
  return { _id: id };
}

function addLegacyId(obj) {
  if (!obj) return obj;
  const out = { ...obj };
  if (out.mysqlId != null) out.id = out.mysqlId;
  else if (out._id != null) out.id = String(out._id);
  return out;
}

module.exports = { isNumericId, buildIdQuery, addLegacyId };
