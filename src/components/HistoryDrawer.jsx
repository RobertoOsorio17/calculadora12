import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Paper,
  Chip,
  useTheme,
  alpha,
  Button,
  Checkbox,
  Tooltip,
  Fab,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TimelineIcon from '@mui/icons-material/Timeline';
import EditIcon from '@mui/icons-material/Edit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { motion, AnimatePresence } from 'framer-motion';
import ExportModal from './modals/ExportModal';
import ImportModal from './modals/ImportModal';
import DeleteConfirmationModal from './modals/DeleteConfirmationModal';

const HistoryDrawer = ({ 
  open, 
  onClose, 
  history, 
  onSelectOperation, 
  onDeleteOperation,
  onToggleFavorite,
  onCopyResult,
}) => {
  const theme = useTheme();
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const getDisplayText = (item) => {
    if (typeof item === 'string') return item;
    if (item.equation) return item.equation;
    if (item.operation) return item.operation;
    return JSON.stringify(item);
  };

  const filteredHistory = history.filter(item => 
    getDisplayText(item).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleSelect = (index) => {
    setSelectedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleDeleteSelected = () => {
    onDeleteOperation(selectedItems);
    setSelectedItems([]);
    setIsEditMode(false);
  };

  const handleExitEditMode = () => {
    setIsEditMode(false);
    setSelectedItems([]);
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400 },
            background: theme.palette.background.default,
            borderLeft: `1px solid ${theme.palette.divider}`,
            boxShadow: `-8px 0 32px ${alpha(theme.palette.common.black, 0.1)}`,
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            background: theme.palette.background.paper,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 2,
          }}>
            <Typography variant="h6" color="primary">
              {isEditMode 
                ? `Seleccionados: ${selectedItems.length}`
                : 'Historial'
              }
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {isEditMode ? (
                <>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={() => setShowDeleteModal(true)}
                    disabled={selectedItems.length === 0}
                  >
                    Eliminar ({selectedItems.length})
                  </Button>
                  <IconButton onClick={handleExitEditMode}>
                    <CloseIcon />
                  </IconButton>
                </>
              ) : (
                <>
                  <Tooltip title="Modo selección" arrow>
                    <IconButton
                      onClick={() => setIsEditMode(true)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <IconButton onClick={onClose} color="primary">
                    <CloseIcon />
                  </IconButton>
                </>
              )}
            </Box>
          </Box>

          {!isEditMode && (
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FileUploadIcon />}
                onClick={() => setShowImportModal(true)}
                sx={{ flex: 1 }}
              >
                Importar
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FileDownloadIcon />}
                onClick={() => setShowExportModal(true)}
                sx={{ flex: 1 }}
              >
                Exportar
              </Button>
              {history.length > 0 && (
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setShowDeleteModal(true)}
                  sx={{ flex: 1 }}
                >
                  Vaciar
                </Button>
              )}
            </Box>
          )}

          <TextField
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar operaciones..."
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: theme.palette.background.paper,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.02),
                },
              },
            }}
          />
        </Box>

        <List sx={{ p: 0 }}>
          <AnimatePresence>
            {filteredHistory.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <ListItem
                  disablePadding
                  secondaryAction={
                    !isEditMode && (
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 0.5,
                        pr: 1,
                      }}>
                        <IconButton 
                          onClick={() => onCopyResult(item)}
                          size="small"
                          sx={{
                            color: theme.palette.text.secondary,
                            '&:hover': {
                              color: theme.palette.primary.main,
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            },
                          }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={() => onToggleFavorite(index)}
                          size="small"
                          sx={{
                            color: item.isFavorite ? theme.palette.warning.main : theme.palette.text.secondary,
                            '&:hover': {
                              color: theme.palette.warning.main,
                              backgroundColor: alpha(theme.palette.warning.main, 0.1),
                            },
                          }}
                        >
                          {item.isFavorite ? (
                            <StarIcon fontSize="small" />
                          ) : (
                            <StarBorderIcon fontSize="small" />
                          )}
                        </IconButton>
                        <IconButton
                          onClick={() => onDeleteOperation([index])}
                          size="small"
                          sx={{
                            color: theme.palette.text.secondary,
                            '&:hover': {
                              color: theme.palette.error.main,
                              backgroundColor: alpha(theme.palette.error.main, 0.1),
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )
                  }
                >
                  <ListItemButton 
                    onClick={() => {
                      if (isEditMode) {
                        handleToggleSelect(index);
                      } else {
                        onSelectOperation(item);
                        setSelectedItem(selectedItem === index ? null : index);
                      }
                    }}
                    selected={isEditMode ? selectedItems.includes(index) : selectedItem === index}
                    sx={{
                      py: 2,
                      px: 2,
                      '&.Mui-selected': {
                        backgroundColor: isEditMode 
                          ? alpha(theme.palette.primary.main, 0.15)
                          : alpha(theme.palette.primary.main, 0.08),
                        '&:hover': {
                          backgroundColor: isEditMode
                            ? alpha(theme.palette.primary.main, 0.2)
                            : alpha(theme.palette.primary.main, 0.12),
                        },
                      },
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      },
                    }}
                  >
                    {isEditMode && (
                      <Checkbox
                        checked={selectedItems.includes(index)}
                        onChange={() => handleToggleSelect(index)}
                        onClick={(e) => e.stopPropagation()}
                        sx={{ mr: 1 }}
                      />
                    )}
                    <ListItemText
                      primary={
                        <Typography variant="body1" color="text.primary">
                          {getDisplayText(item)}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          gap: 1,
                          mt: 0.5,
                        }}>
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                          >
                            <AccessTimeIcon fontSize="inherit" />
                            {new Date(item.timestamp).toLocaleString()}
                          </Typography>
                          <Chip
                            label={item.type || 'basic'}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                            }}
                          />
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>

                {selectedItem === index && item.steps && (
                  <Box sx={{ 
                    px: 2, 
                    pb: 2,
                    background: alpha(theme.palette.primary.main, 0.02),
                  }}>
                    <Paper
                      variant="outlined"
                      sx={{ 
                        p: 2,
                        bgcolor: theme.palette.background.paper,
                        borderColor: alpha(theme.palette.primary.main, 0.2),
                      }}
                    >
                      <Typography 
                        variant="subtitle2" 
                        gutterBottom
                        color="primary"
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <TimelineIcon fontSize="small" />
                        Pasos de resolución
                      </Typography>
                      <List dense>
                        {item.steps.map((step, stepIndex) => (
                          <ListItem 
                            key={stepIndex}
                            sx={{
                              borderLeft: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                              ml: 1,
                              '&:hover': {
                                borderLeftColor: theme.palette.primary.main,
                                backgroundColor: alpha(theme.palette.primary.main, 0.02),
                              },
                            }}
                          >
                            <ListItemText
                              primary={
                                <Typography 
                                  variant="body2"
                                  color="text.primary"
                                  sx={{ pl: 1 }}
                                >
                                  {step}
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  </Box>
                )}

                <Divider />
              </motion.div>
            ))}
          </AnimatePresence>
        </List>

        {isEditMode && selectedItems.length > 0 && (
          <Fab
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16 + (theme.spacing(50)), // Ajustado para que no se solape con el drawer
            }}
            onClick={() => setShowDeleteModal(true)}
          >
            <DeleteIcon />
          </Fab>
        )}
      </Drawer>

      <ExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        history={history}
      />

      <ImportModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
      />

      <DeleteConfirmationModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          if (isEditMode && selectedItems.length > 0) {
            handleDeleteSelected();
          } else {
            onDeleteOperation('all');
          }
          setShowDeleteModal(false);
        }}
      />
    </>
  );
};

export default HistoryDrawer; 