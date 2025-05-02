using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NewsPortal.Application.DTOs;
using NewsPortal.Domain.Entities;
using NewsPortal.Infrastructure.Data.Repositories;

namespace NewsPortal.Application.Services
{
    public class TagService
    {
        private readonly TagRepository _tagRepository;

        public TagService(TagRepository tagRepository)
        {
            _tagRepository = tagRepository;
        }

        public async Task<List<TagDto>> GetAllTagsAsync()
        {
            var tags = await _tagRepository.GetAllTagsAsync();
            return tags.Select(MapToTagDto).ToList();
        }

        public async Task<TagDto> GetTagByIdAsync(int id)
        {
            var tag = await _tagRepository.GetTagByIdAsync(id);
            if (tag == null)
            {
                return null;
            }

            return MapToTagDto(tag);
        }

        public async Task<TagDto> CreateTagAsync(CreateTagDto createTagDto)
        {
            var tag = new Tag
            {
                Name = createTagDto.Name
            };

            var createdTag = await _tagRepository.CreateTagAsync(tag);
            return MapToTagDto(createdTag);
        }

        public async Task<TagDto> UpdateTagAsync(int id, UpdateTagDto updateTagDto)
        {
            var tag = await _tagRepository.GetTagByIdAsync(id);
            if (tag == null)
            {
                return null;
            }

            tag.Name = updateTagDto.Name;

            var updatedTag = await _tagRepository.UpdateTagAsync(tag);
            return MapToTagDto(updatedTag);
        }

        public async Task<bool> DeleteTagAsync(int id)
        {
            var tag = await _tagRepository.GetTagByIdAsync(id);
            if (tag == null)
            {
                return false;
            }

            await _tagRepository.DeleteTagAsync(id);
            return true;
        }

        private TagDto MapToTagDto(Tag tag)
        {
            return new TagDto
            {
                Id = tag.Id,
                Name = tag.Name
            };
        }
    }
} 